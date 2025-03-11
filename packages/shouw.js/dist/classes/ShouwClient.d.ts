import type { ShouwClientOptions, CommandData } from '../typings';
import { FunctionsManager, CommandsManager } from './';
import { BaseClient } from './BaseClient';
export declare class ShouwClient extends BaseClient {
    functions: FunctionsManager;
    commands: CommandsManager;
    readonly prefix: Array<string>;
    readonly shouwOptions: ShouwClientOptions;
    constructor(options: ShouwClientOptions);
    command(data: CommandData): ShouwClient;
    debug(message: any, type?: 'ERROR' | 'DEBUG', force?: boolean): ShouwClient;
}
