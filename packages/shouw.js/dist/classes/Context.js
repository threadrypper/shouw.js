"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const discord_js_1 = require("discord.js");
class Context {
    constructor(ctx, args) {
        this.interaction = ctx instanceof discord_js_1.Message ? null : ctx;
        this.args = args;
        this.message = ctx instanceof discord_js_1.Message ? ctx : null;
        this.channel = ctx.channel;
        this.member = ctx.member;
        this.guild = ctx.guild;
    }
    get isInteraction() {
        return (!!this.interaction &&
            (this.interaction instanceof discord_js_1.ChatInputCommandInteraction ||
                this.interaction instanceof discord_js_1.MessageComponentInteraction ||
                this.interaction instanceof discord_js_1.ModalSubmitInteraction ||
                this.interaction instanceof discord_js_1.ContextMenuCommandInteraction));
    }
    async send(data) {
        if (!this.isInteraction) {
            if (!this.channel)
                return void 0;
            return await this.channel?.send(data);
        }
        return await this.reply(data);
    }
    async reply(data) {
        if (this.isInteraction)
            return await this.interaction?.reply(data);
        return await this.message?.reply(data);
    }
}
exports.Context = Context;
