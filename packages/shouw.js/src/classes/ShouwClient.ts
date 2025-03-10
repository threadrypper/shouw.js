import * as path from 'node:path';
import { blue } from 'chalk';
import type { ShouwClientOptions, CommandData } from '../typings';
import { FunctionsManager, CommandsManager } from './';
import { BaseClient } from './BaseClient';

export class ShouwClient extends BaseClient {
    public functions: FunctionsManager;
    public commands: CommandsManager;
    public readonly prefix: Array<string>;
    public readonly shouwOptions: ShouwClientOptions;

    constructor(options: ShouwClientOptions) {
        super(options);
        this.shouwOptions = options;
        this.prefix = Array.isArray(options.prefix) ? options.prefix : [options.prefix];
        this.functions = new FunctionsManager(this);
        this.commands = new CommandsManager(this, options.events);
        this.functions.load(path.join(__dirname, '../functions'), options.debug ?? false);
    }

    public command(data: CommandData): ShouwClient {
        const command = this.commands[data.type];
        if (!command) return this;
        command.set(command.size, data);
        return this;
    }

    public debug(message, type: 'ERROR' | 'DEBUG' = 'DEBUG'): ShouwClient {
        if (message && this.shouwOptions.debug === true) {
            console.log(`[${blue(type)}] :: ${message}`);
        }

        return this;
    }
}
