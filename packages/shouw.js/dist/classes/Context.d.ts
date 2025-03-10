import type { TextChannel, User, Guild, GuildMember, OmitPartialGroupDMChannel, InteractionCallbackResponse } from 'discord.js';
import type { Interaction, InteractionWithMessage, SendData, MessageReplyData, InteractionReplyData } from '../typings';
import { Message } from 'discord.js';
export declare class Context {
    args?: Array<string>;
    channel?: TextChannel;
    user?: User;
    member?: GuildMember;
    guild?: Guild;
    message?: Message | null;
    interaction: Interaction | null;
    constructor(ctx: InteractionWithMessage, args: Array<string>);
    private get isInteraction();
    send(data: SendData): Promise<Message<boolean> | undefined>;
    reply(data: MessageReplyData): Promise<Message<boolean> | OmitPartialGroupDMChannel<Message<boolean>> | undefined>;
    reply(data: InteractionReplyData): Promise<InteractionCallbackResponse>;
}
