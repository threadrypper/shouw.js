import type { Message } from 'discord.js';
import { type ShouwClient, Context } from '../classes';
import { Interpreter } from '../core';
import type { InterpreterOptions, CommandData } from '../typings';

export default async function Events(message: Message, client: ShouwClient) {
    if (message.author.bot) return;
    const commands = client.commands?.messageCreate?.V;
    if (!commands) return;

    const prefixes: Promise<string | undefined>[] = client.prefix
        .map(async (prefix) => {
            if (!prefix.match(/\$/g) || prefix === '$') return prefix;
            return await Init(
                {
                    name: 'prefix',
                    type: 'parsing',
                    code: prefix
                },
                message,
                message.content?.split(/ +/g) ?? [],
                client
            );
        })
        .filter(Boolean);

    for (const RawPrefix of prefixes) {
        const prefix = await RawPrefix;
        if (!prefix) continue;
        if (!message.content || !message.content.startsWith(prefix)) continue;

        const args = message.content?.slice(prefix.length).split(/ +/g) ?? [];
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) continue;
        const command = commands.find((cmd) => cmd.name === commandName || cmd.aliases?.includes(commandName));
        if (!command || !command.code) break;

        await Init(command, message, args, client);
    }

    const alwaysExecute: CommandData[] | undefined = commands.filter(
        (v: CommandData) => v.name?.toLowerCase() === '$alwaysexecute'
    );
    if (Array.isArray(alwaysExecute)) {
        for (const command of alwaysExecute) {
            if (!command || !command.code) break;
            await Init(command, message, message.content?.split(/ +/g) ?? [], client);
        }
    }
}

async function Init(
    command: CommandData,
    message: Message,
    args: string[],
    client: ShouwClient
): Promise<string | undefined> {
    return (
        (
            await new Interpreter(
                command,
                {
                    context: new Context(message, args),
                    client: client,
                    channel: message.channel,
                    args: args,
                    guild: message.guild,
                    user: message.author,
                    member: message.member
                } as InterpreterOptions,
                {
                    sendMessage: true,
                    returnId: false,
                    returnResult: true,
                    returnError: false,
                    returnData: false
                }
            ).initialize()
        ).result ?? void 0
    );
}
