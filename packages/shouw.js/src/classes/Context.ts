import type {
    TextChannel,
    User,
    Guild,
    GuildMember,
    OmitPartialGroupDMChannel,
    InteractionCallbackResponse
} from 'discord.js';
import type { Interaction, InteractionWithMessage, SendData, MessageReplyData, InteractionReplyData } from '../typings';
import {
    Message,
    ChatInputCommandInteraction,
    MessageComponentInteraction,
    ModalSubmitInteraction,
    ContextMenuCommandInteraction
} from 'discord.js';

export class Context {
    public args?: Array<string>;
    public channel?: TextChannel;
    public user?: User;
    public member?: GuildMember;
    public guild?: Guild;
    public message?: Message | null;
    public interaction: Interaction | null;

    constructor(ctx: InteractionWithMessage, args: Array<string>) {
        this.interaction = ctx instanceof Message ? null : ctx;
        this.args = args;
        this.message = ctx instanceof Message ? ctx : null;
        this.channel = ctx.channel as TextChannel;
        this.member = ctx.member as GuildMember;
        this.guild = ctx.guild as Guild;
    }

    private get isInteraction(): boolean {
        return (
            !!this.interaction &&
            (this.interaction instanceof ChatInputCommandInteraction ||
                this.interaction instanceof MessageComponentInteraction ||
                this.interaction instanceof ModalSubmitInteraction ||
                this.interaction instanceof ContextMenuCommandInteraction)
        );
    }

    public async send(data: SendData): Promise<Message<boolean> | undefined> {
        if (!this.isInteraction) {
            if (!this.channel) return void 0;
            return await this.channel?.send(data);
        }

        return await this.reply(data);
    }

    public async reply(
        data: MessageReplyData
    ): Promise<Message<boolean> | OmitPartialGroupDMChannel<Message<boolean>> | undefined>;
    public async reply(data: InteractionReplyData): Promise<InteractionCallbackResponse>;
    public async reply(data: any): Promise<any> {
        if (this.isInteraction) return await this.interaction?.reply(data);
        return await this.message?.reply(data);
    }
}
