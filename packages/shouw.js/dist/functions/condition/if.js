"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const typings_1 = require("../../typings");
class If extends core_1.Functions {
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
                    type: typings_1.ParamType.String
                }
            ]
        });
    }
}
exports.default = If;
