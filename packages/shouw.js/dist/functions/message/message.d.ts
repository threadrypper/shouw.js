import { Functions, type Interpreter } from '../../core';
import type { FunctionResultData } from '../../typings';
export default class Get extends Functions {
    constructor();
    code(ctx: Interpreter, [index]: [number?]): FunctionResultData;
}
