import { Functions } from '../../core';
import type { FunctionData } from '../../typings';
import { ParamType } from '../../typings';

export default class If extends Functions {
    constructor() {
        super({
            name: '$if',
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
}
