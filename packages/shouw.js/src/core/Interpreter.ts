import type {
    Channel,
    BitFieldResolvable,
    MessageFlags,
    JSONEncodable,
    APIActionRowComponent,
    APIMessageActionRowComponent,
    ActionRowData,
    MessageActionRowComponentData,
    MessageActionRowComponentBuilder
} from 'discord.js';
import type { CommandData, HelpersData, ExtraOptionsData, TemporarilyData, InterpreterOptions } from '../typings';
import type { Functions } from './Functions';
import type { Context, FunctionsManager, ShouwClient as Client } from '../classes';

import { CheckCondition, IF } from './';
import { ParamType } from '../typings';
import * as chalk from 'chalk';
import * as Discord from 'discord.js';

export class Interpreter {
    public readonly client: Client;
    public readonly functions: FunctionsManager;
    public readonly debug: boolean | undefined;

    public code: string | ((ctx: Interpreter) => any);
    public command: CommandData;
    public channel?: Channel;
    public guild?: Discord.Guild;
    public member?: Discord.GuildMember;
    public user?: Discord.User;
    public context?: Context;
    public args?: string[];
    public embeds: Discord.EmbedBuilder[];
    public attachments: Discord.AttachmentBuilder[];
    public stickers: Discord.Sticker[];
    public flags: number | string | bigint | undefined;
    public message: Discord.Message | undefined;
    public noop: () => void = () => {};
    public helpers: HelpersData;
    public Temporarily: TemporarilyData;
    public discord: typeof Discord = Discord;
    public readonly extras: ExtraOptionsData;
    public components: readonly (
        | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>
        | ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder>
        | APIActionRowComponent<APIMessageActionRowComponent>
    )[];

    constructor(cmd: CommandData, options: InterpreterOptions, extras?: ExtraOptionsData) {
        this.client = options.client;
        this.functions = this.client.functions;
        this.debug = options.debug;
        this.code = cmd.code;
        this.command = cmd;
        this.channel = options.channel;
        this.guild = options.guild;
        this.member = options.member;
        this.user = options.user;
        this.context = options.context;
        this.args = options.args;
        this.embeds = [];
        this.attachments = [];
        this.components = [];
        this.stickers = [];
        this.flags = void 0;
        this.message = void 0;
        this.helpers = {
            condition: CheckCondition,
            interpreter: Interpreter,
            unescape: (str: string) => str.unescape(),
            escape: (str: string) => str.escape()
        };
        this.Temporarily =
            (options.Temporarily as TemporarilyData) ??
            ({
                arrays: {},
                variables: {},
                splits: [],
                randoms: {},
                timezone: 'UTC'
            } as TemporarilyData);
        this.extras =
            (extras as ExtraOptionsData) ??
            ({
                sendMessage: true,
                returnId: false,
                returnResult: true,
                returnError: false,
                returnData: false
            } as ExtraOptionsData);
    }

    public async initialize(): Promise<{
        id?: string;
        result?: undefined | string;
        error?: boolean;
        data?: object;
    }> {
        try {
            if (typeof this.code === 'function') {
                await this.code(this);
                return {};
            }

            let result: string = this.code;
            let error = false;

            const processFunction = async (code: string): Promise<string> => {
                const functions = this.extractFunctions(code);
                if (functions.length === 0) return code;
                let currentCode = code;

                for (const func of functions) {
                    if (!currentCode || currentCode.trim() === '') break;
                    if (func.match(/(\$if|\$endif)$/i) && currentCode.match(/(\$if|\$endif)$/i)) {
                        const { code: ifCode, error: isError } = await IF(currentCode, this);
                        error = isError;
                        currentCode = isError ? ifCode : await processFunction(ifCode);
                        break;
                    }

                    const unpacked = this.unpack(func, currentCode);
                    const functionData: Functions | undefined = this.functions.get(func);
                    if (!unpacked.all || !functionData || !functionData.code || typeof functionData.code !== 'function')
                        continue;

                    if (functionData.brackets && !unpacked.brackets) {
                        error = await this.error({
                            message: `Invalid ${func} usage: Missing brackets`,
                            solution: `Make sure to add brackets to the function. Example: ${functionData.withParams}`
                        });
                        break;
                    }

                    const processedArgs: Array<unknown> = [];
                    if (unpacked.args.length > 0) {
                        for (let i = 0; i < functionData.paramsLength; i++) {
                            const field = functionData.getParams(i);
                            if (!field) break;

                            const arg = this.switchArg(
                                (unpacked.args[i] ?? '') as string,
                                field.type ?? ParamType.String
                            );

                            if (field.type !== ParamType.Boolean && (!arg || arg === '')) {
                                if (field.required) {
                                    error = await this.error({
                                        message: `Missing required argument ${field.name} on function ${func}!`,
                                        solution: 'Make sure to add all required argument to the function.'
                                    });
                                    break;
                                }

                                processedArgs.push(void 0);
                                continue;
                            }

                            if ((typeof arg === 'string' && !arg.match(/\$/g)) || typeof arg !== 'string') {
                                processedArgs.push(arg);
                                continue;
                            }

                            const processed = await processFunction(arg);
                            if (
                                (!processed || processed === '') &&
                                field.required &&
                                field.type !== ParamType.Boolean
                            ) {
                                error = await this.error({
                                    message: `Missing required argument ${field.name} on function ${func}!`,
                                    solution: 'Make sure to add all required argument to the function.'
                                });
                                break;
                            }

                            processedArgs.push(processed);
                        }
                    }

                    unpacked.args = processedArgs;
                    if (error) break;

                    const DATA =
                        (await functionData.code(
                            {
                                ...this,
                                interpreter: Interpreter,
                                data: this.Temporarily
                            },
                            processedArgs,
                            this.Temporarily
                        )) ?? {};

                    currentCode = currentCode.replace(unpacked.all, DATA.result?.toString().escape() ?? '');
                    if (error || DATA.error === true) {
                        error = true;
                        break;
                    }

                    for (const [key, value] of Object.entries(DATA)) {
                        if (!key || !value || !Object.hasOwn(this, key)) continue;
                        this[key] = value;
                    }
                }

                return currentCode.unescape().trim();
            };

            result = await processFunction(result);
            this.code = result;

            if (
                this.extras.sendMessage === true &&
                error === false &&
                ((this.code && this.code !== '') ||
                    this.components.length > 0 ||
                    this.embeds.length > 0 ||
                    this.attachments.length > 0)
            ) {
                this.message = (await this.context?.send({
                    content: this.code !== '' ? this.code : void 0,
                    embeds: this.embeds,
                    components: this.components,
                    files: this.attachments,
                    flags: this.flags as
                        | BitFieldResolvable<
                              'SuppressEmbeds' | 'SuppressNotifications',
                              MessageFlags.SuppressEmbeds | MessageFlags.SuppressNotifications
                          >
                        | undefined
                })) as Discord.Message;
            }

            return {
                ...(error === false &&
                    this.extras.returnResult === true && {
                        result: this.code
                    }),
                ...(this.extras.returnId === true && {
                    id: this.message?.id
                }),
                ...(this.extras.returnError === true && {
                    error: error
                }),
                ...(this.extras.returnData === true && {
                    data: {
                        ...this.Temporarily,
                        embeds: this.embeds,
                        components: this.components,
                        attachments: this.attachments,
                        flags: this.flags,
                        args: this.args
                    }
                })
            };
        } catch (err: any) {
            console.log(`[${chalk.red('ERROR')}] :: ${err?.stack ?? err}`);
            return {};
        }
    }

    private unpack(
        func: string,
        code: string
    ): {
        func: string;
        args: Array<unknown>;
        brackets: boolean;
        all: string | null;
    } {
        const funcStart = code.toLowerCase().indexOf(func.toLowerCase());
        if (funcStart === -1) return { func, args: [], brackets: false, all: null };
        if (funcStart > 0 && code[funcStart - 1] === '$') return { func, args: [], brackets: false, all: func };

        const openBracketIndex = code.indexOf('[', funcStart);
        if (openBracketIndex === -1) return { func, args: [], brackets: false, all: func };

        const textBetween = code.slice(funcStart + func.length, openBracketIndex).trim();
        if (textBetween.match(/\$/)) return { func, args: [], brackets: false, all: func };

        let bracketStack = 0;
        let closeBracketIndex = openBracketIndex;

        while (closeBracketIndex < code.length) {
            const char = code[closeBracketIndex];
            if (char === '[') {
                bracketStack++;
            } else if (char === ']') {
                bracketStack--;
                if (bracketStack === 0) break;
            }

            closeBracketIndex++;
        }

        if (closeBracketIndex >= code.length || bracketStack > 0) return { func, args: [], brackets: false, all: func };
        const argsStr = code.slice(openBracketIndex + 1, closeBracketIndex).trim();
        const args = this.extractArguments(argsStr);
        const all = code.slice(funcStart, closeBracketIndex + 1);
        return { func, args: args.length ? args : [void 0], brackets: true, all };
    }

    private extractArguments(argsStr: string): Array<string> {
        const args: string[] = [];
        let depth = 0;
        let currentArg = '';

        for (let i = 0; i < argsStr.length; i++) {
            const char = argsStr[i];
            if (char === '[') {
                depth++;
                currentArg += char;
            } else if (char === ']') {
                depth--;
                currentArg += char;
            } else if (char === ';' && depth === 0) {
                args.push(currentArg.trim());
                currentArg = '';
            } else {
                currentArg += char;
            }
        }

        if (currentArg.trim()) args.push(currentArg.trim());

        // @ts-ignore
        return args.map((arg: string) => {
            if (arg !== '') return arg;
            return void 0;
        });
    }

    private extractFunctions(code: string): Array<string> {
        const functions: string[] = [];
        const splited = code.split(/\$/g);

        for (const part of splited) {
            const matchingFunctions = [...this.functions.K, '$if', '$endif'].filter(
                (func) => func.toLowerCase() === `$${part.toLowerCase()}`.slice(0, func.length)
            );

            if (matchingFunctions.length === 1) {
                functions.push(matchingFunctions[0]);
            } else if (matchingFunctions.length > 1) {
                functions.push(matchingFunctions.sort((a, b) => b.length - a.length)[0]);
            }
        }

        return functions.filter(Boolean);
    }

    public async error(options: { message: string; solution?: string }): Promise<boolean> {
        try {
            if (!options.message) return true;
            this.message = await this.context?.send(
                `\`\`\`\n🚫 ${options.message}${options.solution ? `\n\nSo, what is the solution?\n${options.solution}` : ''}\`\`\``
            );
            return true;
        } catch {
            this.client.debug(options.message, 'ERROR');
            return true;
        }
    }

    private switchArg(arg: string, type: ParamType): any {
        if (!arg || arg === '' || ParamType.Void === type) return void 0;

        switch (type) {
            case ParamType.String:
                return arg.toString().unescape();
            case ParamType.BigInt:
                return BigInt(arg);
            case ParamType.Number:
                return Number(arg);
            case ParamType.Boolean:
                return arg.toBoolean();
            case ParamType.Object:
                return arg.JSONParse();
            case ParamType.Array:
                return arg.JSONParse();
            case ParamType.URL:
                return arg.toURL();
            default:
                return void 0;
        }
    }
}
