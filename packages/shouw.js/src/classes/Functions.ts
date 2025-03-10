import * as fs from 'node:fs';
import * as path from 'node:path';
import { cyan } from 'chalk';
import { Collective } from '../utils';
import type { Functions } from '../core';
import type { ShouwClient } from './ShouwClient';

export class FunctionsManager extends Collective<string, Functions> {
    public readonly client: ShouwClient;

    constructor(client: ShouwClient) {
        super();
        this.client = client;
    }

    public load(basePath: string, debug: boolean) {
        const files = fs.readdirSync(basePath);
        for (const file of files) {
            const filePath = path.join(basePath, file);
            const stat = fs.lstatSync(filePath);
            if (stat.isDirectory()) {
                this.load(filePath, debug);
            } else {
                if (!file.endsWith('.js')) continue;
                const RawFunction = require(filePath).default;
                const func = new RawFunction();
                this.create(func.name, func);
                this.client.debug(`Function loaded: ${cyan(func.name)}`);
            }
        }
    }
}
