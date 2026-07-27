import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { MessageRow, MessageDto } from '../types/custom-chat.type';
import { MESSAGE_TYPE } from '../enums/chat';

function rowToDto(row: MessageRow): MessageDto {
    return {
        id: row.id,
        chatRoomId: row.chat_room_id,
        senderId: row.sender_id,
        content: row.content,
        messageType: row.message_type,
        isRead: row.is_read,
        createdAt: row.created_at as unknown as string,
    };
}

export class MessageRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(chatRoomId: bigint, senderId: bigint, content: string, messageType: MESSAGE_TYPE = MESSAGE_TYPE.TEXT): Promise<MessageDto> {
        const query = `
            INSERT INTO messages (chat_room_id, sender_id, content, message_type)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result: QueryResult<MessageRow> = await this.db.query(query, [chatRoomId, senderId, content, messageType]);
        return rowToDto(result.rows[0]);
    }

    async getByRoom(chatRoomId: bigint, limit: number = 50, before?: string): Promise<MessageDto[]> {
        let query: string;
        let params: unknown[];

        if (before) {
            query = `
                SELECT * FROM messages
                WHERE chat_room_id = $1 AND id < $2
                ORDER BY created_at DESC
                LIMIT $3
            `;
            params = [chatRoomId, before, limit];
        } else {
            query = `
                SELECT * FROM messages
                WHERE chat_room_id = $1
                ORDER BY created_at DESC
                LIMIT $2
            `;
            params = [chatRoomId, limit];
        }

        const result: QueryResult<MessageRow> = await this.db.query(query, params);
        return result.rows.map(rowToDto);
    }

    async markAsRead(chatRoomId: bigint, userId: bigint): Promise<void> {
        const query = `
            UPDATE messages
            SET is_read = TRUE
            WHERE chat_room_id = $1 AND sender_id != $2 AND is_read = FALSE
        `;
        await this.db.query(query, [chatRoomId, userId]);
    }

    async getUnreadCount(chatRoomId: bigint, userId: bigint): Promise<number> {
        const query = `
            SELECT COUNT(*)::int AS count
            FROM messages
            WHERE chat_room_id = $1 AND sender_id != $2 AND is_read = FALSE
        `;
        const result = await this.db.query(query, [chatRoomId, userId]);
        return result.rows[0]?.count ?? 0;
    }
}

export const messageRepository = new MessageRepository(DatabaseService.getInstance());
