"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreter = void 0;
const _1 = require("./");
const typings_1 = require("../typings");
const chalk = require("chalk");
const Discord = require("discord.js");
class Interpreter {
    constructor(cmd, options, extras) {
        this.noop = () => { };
        this.discord = Discord;
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
            condition: _1.CheckCondition,
            interpreter: Interpreter,
            unescape: (str) => str.unescape(),
            escape: (str) => str.escape()
        };
        this.Temporarily =
            options.Temporarily ??
                {
                    arrays: {},
                    variables: {},
                    splits: [],
                    randoms: {},
                    timezone: 'UTC'
                };
        this.extras =
            extras ??
                {
                    sendMessage: true,
                    returnId: false,
                    returnResult: true,
                    returnError: false,
                    returnData: false
                };
    }
    async initialize() {
        try {
            if (typeof this.code === 'function') {
                await this.code(this);
                return {};
            }
            let error = false;
            const processFunction = async (code) => {
                const functions = this.extractFunctions(code);
                if (functions.length === 0)
                    return code;
                let currentCode = code;
                let oldCode = code;
                for (const func of functions) {
                    if (!oldCode || oldCode.trim() === '')
                        break;
                    const unpacked = this.unpack(func, oldCode);
                    const functionData = this.functions.get(func);
                    if (!unpacked.all || !functionData || !functionData.code || typeof functionData.code !== 'function')
                        continue;
                    if (functionData.brackets && !unpacked.brackets) {
                        error = await this.error({
                            message: `Invalid ${func} usage: Missing brackets`,
                            solution: `Make sure to add brackets to the function. Example: ${functionData.withParams}`
                        });
                        break;
                    }
                    if (func.match(/\$if$/i)) {
                        const { code: ifCode, error: isError } = await (0, _1.IF)(oldCode, this);
                        error = isError;
                        currentCode = isError ? ifCode : await processFunction(ifCode);
                        break;
                    }
                    const processedArgs = [];
                    if (unpacked.args.length > 0) {
                        for (let i = 0; i < functionData.paramsLength; i++) {
                            const field = functionData.getParams(i);
                            if (!field)
                                break;
                            const arg = this.switchArg((unpacked.args[i] ?? ''), field.type ?? typings_1.ParamType.String);
                            if (field.type !== typings_1.ParamType.Boolean && (!arg || arg === '')) {
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
                            if ((!processed || processed === '') &&
                                field.required &&
                                field.type !== typings_1.ParamType.Boolean) {
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
                    if (error)
                        break;
                    const DATA = (await functionData.code({
                        ...this,
                        interpreter: Interpreter,
                        data: this.Temporarily
                    }, processedArgs, this.Temporarily)) ?? {};
                    currentCode = currentCode.replace(unpacked.all, DATA.result?.toString() ?? '');
                    oldCode = oldCode.replace(unpacked.all, '');
                    if (error || DATA.error === true) {
                        error = true;
                        break;
                    }
                    for (const [key, value] of Object.entries(DATA)) {
                        if (!key || !value || !Object.hasOwn(this, key))
                            continue;
                        this[key] = value;
                    }
                }
                return currentCode.trim();
            };
            this.code = (await processFunction(this.code)).unescape();
            if (this.extras.sendMessage === true &&
                error === false &&
                ((this.code && this.code !== '') ||
                    this.components.length > 0 ||
                    this.embeds.length > 0 ||
                    this.attachments.length > 0)) {
                this.message = (await this.context?.send({
                    content: this.code !== '' ? this.code : void 0,
                    embeds: this.embeds,
                    components: this.components,
                    files: this.attachments,
                    flags: this.flags
                }));
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
        }
        catch (err) {
            console.log(`[${chalk.red('ERROR')}] :: ${err?.stack ?? err}`);
            return {};
        }
    }
    unpack(func, code) {
        const funcStart = code.toLowerCase().indexOf(func.toLowerCase());
        if (funcStart === -1)
            return { func, args: [], brackets: false, all: null };
        if (funcStart > 0 && code[funcStart - 1] === '$')
            return { func, args: [], brackets: false, all: func };
        const openBracketIndex = code.indexOf('[', funcStart);
        if (openBracketIndex === -1)
            return { func, args: [], brackets: false, all: func };
        const textBetween = code.slice(funcStart + func.length, openBracketIndex).trim();
        if (textBetween.match(/\$/))
            return { func, args: [], brackets: false, all: func };
        let bracketStack = 0;
        let closeBracketIndex = openBracketIndex;
        while (closeBracketIndex < code.length) {
            const char = code[closeBracketIndex];
            if (char === '[') {
                bracketStack++;
            }
            else if (char === ']') {
                bracketStack--;
                if (bracketStack === 0)
                    break;
            }
            closeBracketIndex++;
        }
        if (closeBracketIndex >= code.length || bracketStack > 0)
            return { func, args: [], brackets: false, all: func };
        const argsStr = code.slice(openBracketIndex + 1, closeBracketIndex).trim();
        const args = this.extractArguments(argsStr);
        const all = code.slice(funcStart, closeBracketIndex + 1);
        return { func, args: args.length ? args : [void 0], brackets: true, all };
    }
    extractArguments(argsStr) {
        const args = [];
        let depth = 0;
        let currentArg = '';
        for (let i = 0; i < argsStr.length; i++) {
            const char = argsStr[i];
            if (char === '[') {
                depth++;
                currentArg += char;
            }
            else if (char === ']') {
                depth--;
                currentArg += char;
            }
            else if (char === ';' && depth === 0) {
                args.push(currentArg.trim());
                currentArg = '';
            }
            else {
                currentArg += char;
            }
        }
        if (currentArg.trim())
            args.push(currentArg.trim());
        // @ts-ignore
        return args.map((arg) => {
            if (arg !== '')
                return arg;
            return void 0;
        });
    }
    extractFunctions(code) {
        const functions = [];
        const splited = code.split(/\$/g);
        for (const part of splited) {
            const matchingFunctions = this.functions.K.filter((func) => func.toLowerCase() === `$${part.toLowerCase()}`.slice(0, func.length));
            if (matchingFunctions.length === 1) {
                functions.push(matchingFunctions[0]);
            }
            else if (matchingFunctions.length > 1) {
                functions.push(matchingFunctions.sort((a, b) => b.length - a.length)[0]);
            }
        }
        return functions.filter(Boolean);
    }
    async error(options) {
        try {
            if (!options.message)
                return true;
            this.message = await this.context?.send(`\`\`\`\n🚫 ${options.message}${options.solution ? `\n\nSo, what is the solution?\n${options.solution}` : ''}\`\`\``);
            return true;
        }
        catch {
            this.client.debug(options.message, 'ERROR');
            return true;
        }
    }
    switchArg(arg, type) {
        if (!arg || arg === '' || typings_1.ParamType.Void === type)
            return void 0;
        switch (type) {
            case typings_1.ParamType.String:
                return arg.toString();
            case typings_1.ParamType.BigInt:
                return BigInt(arg);
            case typings_1.ParamType.Number:
                return Number(arg);
            case typings_1.ParamType.Boolean:
                return arg.toBoolean();
            case typings_1.ParamType.Object:
                return arg.JSONParse();
            case typings_1.ParamType.Array:
                return arg.JSONParse();
            case typings_1.ParamType.URL:
                return arg.toURL();
            default:
                return void 0;
        }
    }
}
exports.Interpreter = Interpreter;
