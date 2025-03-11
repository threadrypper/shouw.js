import { Interpreter } from './Interpreter';
export declare function IF(code: string, oldCode: string, ctx: Interpreter): Promise<{
    error: boolean;
    code: string;
    oldCode: string;
}>;
