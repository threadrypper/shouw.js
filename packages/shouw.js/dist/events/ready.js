"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Events;
const core_1 = require("../core");
async function Events(client) {
    const commands = client.commands?.ready?.V;
    if (!commands)
        return;
    for (const command of commands) {
        if (!command || !command.code)
            break;
        await new core_1.Interpreter(command, {
            client: client
        }, {
            sendMessage: true,
            returnId: false,
            returnResult: false,
            returnError: false,
            returnData: false
        }).initialize();
    }
}
