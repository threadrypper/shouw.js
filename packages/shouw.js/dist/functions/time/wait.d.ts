import { Functions, type Interpreter } from '../../core';
import type { FunctionResultData } from '../../typings';
export default class Wait extends Functions {
    constructor();
    code(ctx: Interpreter, [time]: [string]): Promise<FunctionResultData>;
}
