import { Functions, type Interpreter } from '../../core';
import type { FunctionData, FunctionResultData } from '../../typings';
import { ParamType } from '../../typings';

export default class Get extends Functions {
    constructor() {
        super({
            name: '$message',
            description: `Returns the author's message content`,
            brackets: false,
            params: [
                {
                    name: 'index',
                    description: 'The index of the message content arguments',
                    required: false,
                    type: ParamType.Number
                }
            ]
        } as FunctionData);
    }

    code(ctx: Interpreter, [index = Number.NaN]: [number?]): FunctionResultData {
        let result: string;

        if (Number.isNaN(index)) {
            result = ctx.args?.join(' ') ?? '';
        } else {
            result = ctx.args?.[index - 1] ?? '';
        }

        return {
            result
        };
    }
}
