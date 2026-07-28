import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { MessageRow, MessageDto } from '../types/custom-chat.type';
import { MESSAGE_TYPE } from '../enums/chat';
import logger from '../utils/logger';

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
        logger.debug(`[MessageRepo] Inserting message in roomId=${chatRoomId} from sender=${senderId}`);
        const query = `
            INSERT INTO messages (chat_room_id, sender_id, content, message_type)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result: QueryResult<MessageRow> = await this.db.query(query, [chatRoomId, senderId, content, messageType]);
        logger.info(`[MessageRepo] Message inserted: id=${result.rows[0].id} in roomId=${chatRoomId}`);
        return rowToDto(result.rows[0]);
    }

    async getByRoom(chatRoomId: bigint, limit: number = 50, before?: string): Promise<MessageDto[]> {
        logger.debug(`[MessageRepo] Fetching messages for roomId=${chatRoomId}, limit=${limit}, before=${before || 'none'}`);
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
        logger.debug(`[MessageRepo] Fetched ${result.rows.length} messages for roomId=${chatRoomId}`);
        return result.rows.map(rowToDto);
    }

    async markAsRead(chatRoomId: bigint, userId: bigint): Promise<void> {
        logger.debug(`[MessageRepo] Marking messages as read in roomId=${chatRoomId} for user=${userId}`);
        const query = `
            UPDATE messages
            SET is_read = TRUE
            WHERE chat_room_id = $1 AND sender_id != $2 AND is_read = FALSE
        `;
        const result = await this.db.query(query, [chatRoomId, userId]);
        logger.debug(`[MessageRepo] Marked ${(result as any).rowCount || 0} messages as read in roomId=${chatRoomId}`);
    }

    async getUnreadCount(chatRoomId: bigint, userId: bigint): Promise<number> {
        const query = `
            SELECT COUNT(*)::int AS count
            FROM messages
            WHERE chat_room_id = $1 AND sender_id != $2 AND is_read = FALSE
        `;
        const result = await this.db.query(query, [chatRoomId, userId]);
        const count = result.rows[0]?.count ?? 0;
        logger.debug(`[MessageRepo] Unread count for roomId=${chatRoomId}, user=${userId}: ${count}`);
        return count;
    }
}

export const messageRepository = new MessageRepository(DatabaseService.getInstance());
