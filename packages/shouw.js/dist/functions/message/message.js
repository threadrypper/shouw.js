"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const typings_1 = require("../../typings");
class Get extends core_1.Functions {
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
                    type: typings_1.ParamType.Number
                }
            ]
        });
    }
    code(ctx, [index = Number.NaN]) {
        let result;
        if (Number.isNaN(index)) {
            result = ctx.args?.join(' ') ?? '';
        }
        else {
            result = ctx.args?.[index - 1] ?? '';
        }
        return {
            result
        };
    }
}
exports.default = Get;
