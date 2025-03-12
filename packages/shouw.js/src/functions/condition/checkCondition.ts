import { Functions, type Interpreter } from '../../core';
import type { FunctionData, FunctionResultData } from '../../typings';
import { ParamType } from '../../typings';

export default class CheckCondition extends Functions {
    constructor() {
        super({
            name: '$checkCondition',
            description: 'Check a condition wether true or false',
            brackets: true,
            params: [
                {
                    name: 'condition',
                    description: 'The condition you want to check',
                    required: true,
                    type: ParamType.String
                }
            ]
        } as FunctionData);
    }

    code(ctx: Interpreter, [condition]: [string]): FunctionResultData {
        return this.success(condition ? ctx.helpers.condition.solve(condition) : false);
    }
}
