import { Functions, type Interpreter } from '../../core';
import type { FunctionResultData, TemporarilyData } from '../../typings';
export default class Let extends Functions {
    constructor();
    code(_ctx: Interpreter, [varname, value]: [string, string], data: TemporarilyData): FunctionResultData;
}
