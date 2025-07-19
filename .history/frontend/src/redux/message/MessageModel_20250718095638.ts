import {UUID} from "node:crypto";
import {UserDTO} from "../auth/AuthModel";
import {ChatDTO} from "../chat/ChatModel";

export interface MessageDTO {
    id: UUID;
    content: string;
    timeStamp: string;
    user: UserDTO;
    readBy: UUID[];
    reactions?: Record<string, UUID[]>;
    replyTo?: MessageDTO | null;
}

export interface WebSocketMessageDTO {
    id: UUID;
    content: string;
    timeStamp: string;
    user: UserDTO;
    chat: ChatDTO;
}

export interface SendMessageRequestDTO {
    chatId: UUID;
    content: string;
    replyTo?: UUID | null;
}

export type MessageReducerState = {
    messages: MessageDTO[];
    newMessage: MessageDTO | null;
}