import { Functions, type Interpreter } from '../../core';
import type { FunctionData, FunctionResultData } from '../../typings';
import { ParamType } from '../../typings';

export default class Wait extends Functions {
    constructor() {
        super({
            name: '$wait',
            description: 'Waits for a given amount of time.',
            brackets: false,
            params: [
                {
                    name: 'time',
                    description: 'The time to wait for.',
                    required: true,
                    type: ParamType.String
                }
            ]
        } as FunctionData);
    }

    async code(ctx: Interpreter, [time]: [string]): Promise<FunctionResultData> {
        const timer = Number.isNaN(Number(time)) ? ctx.helpers.time.parse(time).ms || 0 : Number(time);
        await ctx.helpers.sleep(Number(timer));
        return this.success();
    }
}
