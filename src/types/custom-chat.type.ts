import { MESSAGE_TYPE } from '../enums/chat';

export interface ChatRoom {
    id: bigint;
    matchId: bigint;
    user1Id: bigint;
    user2Id: bigint;
    lastMessage: string | null;
    lastMessageAt: Date | null;
    createdAt: Date;
}

export interface ChatRoomRow {
    id: string;
    match_id: string;
    user1_id: string;
    user2_id: string;
    last_message: string | null;
    last_message_at: Date | null;
    created_at: Date;
}

export interface Message {
    id: bigint;
    chatRoomId: bigint;
    senderId: bigint;
    content: string;
    messageType: MESSAGE_TYPE;
    isRead: boolean;
    createdAt: Date;
}

export interface MessageRow {
    id: string;
    chat_room_id: string;
    sender_id: string;
    content: string;
    message_type: number;
    is_read: boolean;
    created_at: Date;
}

export interface MessageDto {
    id: string;
    chatRoomId: string;
    senderId: string;
    content: string;
    messageType: number;
    isRead: boolean;
    createdAt: string;
}
