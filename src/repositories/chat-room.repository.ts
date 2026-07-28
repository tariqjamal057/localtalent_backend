import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { ChatRoom, ChatRoomRow } from '../types/custom-chat.type';
import logger from '../utils/logger';

function rowToDto(row: ChatRoomRow): ChatRoom {
    return {
        id: BigInt(row.id),
        matchId: BigInt(row.match_id),
        user1Id: BigInt(row.user1_id),
        user2Id: BigInt(row.user2_id),
        lastMessage: row.last_message,
        lastMessageAt: row.last_message_at,
        createdAt: row.created_at,
    };
}

export class ChatRoomRepository {
    constructor(private readonly db: DatabaseService) {}

    async createOrGet(matchId: bigint, user1Id: bigint, user2Id: bigint): Promise<ChatRoom> {
        const existing = await this.getByMatchId(matchId);
        if (existing) {
            logger.debug(`[ChatRoomRepo] Existing room found: roomId=${existing.id} for matchId=${matchId}`);
            return existing;
        }
        logger.debug(`[ChatRoomRepo] Inserting new chat room for matchId=${matchId}, user1=${user1Id}, user2=${user2Id}`);
        const query = `
            INSERT INTO chat_rooms (match_id, user1_id, user2_id)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result: QueryResult<ChatRoomRow> = await this.db.query(query, [matchId, user1Id, user2Id]);
        logger.info(`[ChatRoomRepo] New room created: roomId=${result.rows[0].id} for matchId=${matchId}`);
        return rowToDto(result.rows[0]);
    }

    async getByMatchId(matchId: bigint): Promise<ChatRoom | null> {
        const query = `SELECT * FROM chat_rooms WHERE match_id = $1`;
        const result: QueryResult<ChatRoomRow> = await this.db.query(query, [matchId]);
        if (result.rows.length === 0) {
            logger.debug(`[ChatRoomRepo] No room found for matchId=${matchId}`);
            return null;
        }
        return rowToDto(result.rows[0]);
    }

    async getById(roomId: bigint): Promise<ChatRoom | null> {
        const query = `SELECT * FROM chat_rooms WHERE id = $1`;
        const result: QueryResult<ChatRoomRow> = await this.db.query(query, [roomId]);
        if (result.rows.length === 0) {
            logger.debug(`[ChatRoomRepo] No room found for roomId=${roomId}`);
            return null;
        }
        return rowToDto(result.rows[0]);
    }

    async getByUserId(userId: bigint): Promise<ChatRoom[]> {
        const query = `
            SELECT * FROM chat_rooms
            WHERE user1_id = $1 OR user2_id = $1
            ORDER BY last_message_at DESC NULLS LAST, created_at DESC
        `;
        const result: QueryResult<ChatRoomRow> = await this.db.query(query, [userId]);
        logger.debug(`[ChatRoomRepo] Found ${result.rows.length} rooms for userId=${userId}`);
        return result.rows.map(rowToDto);
    }

    async updateLastMessage(roomId: bigint, content: string): Promise<void> {
        const query = `
            UPDATE chat_rooms
            SET last_message = $2, last_message_at = NOW()
            WHERE id = $1
        `;
        await this.db.query(query, [roomId, content]);
        logger.debug(`[ChatRoomRepo] Updated last message for roomId=${roomId}`);
    }
}

export const chatRoomRepository = new ChatRoomRepository(DatabaseService.getInstance());
