import { Functions, type Interpreter } from '../../core';
import type { FunctionData, FunctionResultData, TemporarilyData } from '../../typings';
import { ParamType } from '../../typings';

export default class Let extends Functions {
    constructor() {
        super({
            name: '$let',
            description: 'Will store temporary variables which can be retrieved by $let',
            brackets: true,
            params: [
                {
                    name: 'varname',
                    description: 'Name of the temporary variable',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'value',
                    description: 'Value of the temporary variable you want to save',
                    required: true,
                    type: ParamType.String
                }
            ]
        } as FunctionData);
    }

    code(_ctx: Interpreter, [varname, value]: [string, string], data: TemporarilyData): FunctionResultData {
        data.variables[varname] = value;

        return {
            result: void 0
        };
    }
}
