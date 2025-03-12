"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const typings_1 = require("../../typings");
class Message extends core_1.Functions {
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
        return this.success(Number.isNaN(index) ? ctx.args?.join(' ') : ctx.args?.[index - 1]);
    }
}
exports.default = Message;
