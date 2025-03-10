import type { ShouwClient } from '../classes';
import { Interpreter } from '../core';
import type { InterpreterOptions } from '../typings';

export default async function Events(client: ShouwClient) {
    const commands = client.commands?.ready?.V;
    if (!commands) return;

    for (const command of commands) {
        if (!command || !command.code) break;
        await new Interpreter(
            command,
            {
                client: client
            } as InterpreterOptions,
            {
                sendMessage: true,
                returnId: false,
                returnResult: false,
                returnError: false,
                returnData: false
            }
        ).initialize();
    }
}
