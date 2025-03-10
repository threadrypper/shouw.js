import { Collective } from '../utils';
import type { Functions } from '../core';
import type { ShouwClient } from './ShouwClient';
export declare class FunctionsManager extends Collective<string, Functions> {
    readonly client: ShouwClient;
    constructor(client: ShouwClient);
    load(basePath: string, debug: boolean): Promise<void>;
}
