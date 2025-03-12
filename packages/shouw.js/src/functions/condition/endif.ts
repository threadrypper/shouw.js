import { Functions } from '../../core';
import type { FunctionData } from '../../typings';

export default class Endif extends Functions {
    constructor() {
        super({
            name: '$endif',
            description: 'Ends of the if statement',
            brackets: false
        } as FunctionData);
    }
}
