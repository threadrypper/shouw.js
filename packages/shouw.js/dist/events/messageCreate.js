"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Events;
const classes_1 = require("../classes");
const core_1 = require("../core");
async function Events(message, client) {
    if (message.author.bot)
        return;
    const commands = client.commands?.messageCreate?.V;
    if (!commands)
        return;
    const prefixes = client.prefix
        .map(async (prefix) => {
        if (!prefix.match(/\$/g) || prefix === '$')
            return prefix;
        return await Init({
            name: 'prefix',
            type: 'parsing',
            code: prefix
        }, message, message.content?.split(/ +/g) ?? [], client);
    })
        .filter(Boolean);
    for (const RawPrefix of prefixes) {
        const prefix = await RawPrefix;
        if (!prefix)
            continue;
        if (!message.content || !message.content.startsWith(prefix))
            continue;
        const args = message.content?.slice(prefix.length).split(/ +/g) ?? [];
        const commandName = args.shift()?.toLowerCase();
        if (!commandName)
            continue;
        const command = commands.find((cmd) => cmd.name === commandName || cmd.aliases?.includes(commandName));
        if (!command || !command.code)
            break;
        await Init(command, message, args, client);
    }
    const alwaysExecute = commands.filter((v) => v.name?.toLowerCase() === '$alwaysexecute');
    if (Array.isArray(alwaysExecute)) {
        for (const command of alwaysExecute) {
            if (!command || !command.code)
                break;
            await Init(command, message, message.content?.split(/ +/g) ?? [], client);
        }
    }
}
async function Init(command, message, args, client) {
    return ((await new core_1.Interpreter(command, {
        context: new classes_1.Context(message, args),
        client: client,
        channel: message.channel,
        args: args,
        guild: message.guild,
        user: message.author,
        member: message.member
    }, {
        sendMessage: true,
        returnId: false,
        returnResult: true,
        returnError: false,
        returnData: false
    }).initialize()).result ?? void 0);
}
