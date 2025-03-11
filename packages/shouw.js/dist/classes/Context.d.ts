import type { APIInteractionGuildMember, User, Guild, GuildMember, OmitPartialGroupDMChannel, InteractionCallbackResponse } from 'discord.js';
import type { Interaction, InteractionWithMessage, SendData, MessageReplyData, InteractionReplyData, SendableChannel } from '../typings';
import { Message } from 'discord.js';
export declare class Context {
    args?: Array<string>;
    channel?: SendableChannel;
    user?: User | null;
    member?: GuildMember | APIInteractionGuildMember | null;
    guild?: Guild | null;
    message?: Message | null;
    interaction?: Interaction | null;
    constructor(ctx: InteractionWithMessage, args: Array<string>);
    private get isInteraction();
    send(data: SendData): Promise<Message<boolean> | undefined>;
    reply(data: MessageReplyData): Promise<Message<boolean> | OmitPartialGroupDMChannel<Message<boolean>> | undefined>;
    reply(data: InteractionReplyData): Promise<InteractionCallbackResponse>;
}
