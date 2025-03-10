import type {
    MessagePayload,
    MessageReplyOptions,
    MessageCreateOptions,
    InteractionReplyOptions,
    Message,
    ChatInputCommandInteraction,
    MessageComponentInteraction,
    ModalSubmitInteraction,
    ContextMenuCommandInteraction
} from 'discord.js';

export type Interaction =
    | ChatInputCommandInteraction
    | MessageComponentInteraction
    | ModalSubmitInteraction
    | ContextMenuCommandInteraction;

export type InteractionWithMessage = Interaction | Message;

export type SendData = string | MessagePayload | MessageReplyOptions | MessageCreateOptions;

export type MessageReplyData = string | MessagePayload | MessageReplyOptions;

export type InteractionReplyData =
    | string
    | (InteractionReplyOptions & {
          fetchReply?: boolean;
          withResponse?: boolean;
      });
