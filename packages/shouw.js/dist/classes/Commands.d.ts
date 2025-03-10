import { Collective } from '../utils';
import type { ShouwClient } from './ShouwClient';
import type { CommandData } from '../typings';
export declare class CommandsManager {
    readonly client: ShouwClient;
    readonly events?: Array<string>;
    messageCreate?: Collective<number, CommandData>;
    ready?: Collective<number, CommandData>;
    interactionCreate?: {
        slash: Collective<number, CommandData>;
        button: Collective<number, CommandData>;
        selectMenu: Collective<number, CommandData>;
        modal: Collective<number, CommandData>;
    };
    constructor(client: ShouwClient, events: Array<string>);
}
