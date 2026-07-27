import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { ChatRoom, ChatRoomRow } from '../types/custom-chat.type';

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
        if (existing) return existing;

        const query = `
            INSERT INTO chat_rooms (match_id, user1_id, user2_id)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result: QueryResult<ChatRoomRow> = await this.db.query(query, [matchId, user1Id, user2Id]);
        return rowToDto(result.rows[0]);
    }

    async getByMatchId(matchId: bigint): Promise<ChatRoom | null> {
        const query = `SELECT * FROM chat_rooms WHERE match_id = $1`;
        const result: QueryResult<ChatRoomRow> = await this.db.query(query, [matchId]);
        if (result.rows.length === 0) return null;
        return rowToDto(result.rows[0]);
    }

    async getById(roomId: bigint): Promise<ChatRoom | null> {
        const query = `SELECT * FROM chat_rooms WHERE id = $1`;
        const result: QueryResult<ChatRoomRow> = await this.db.query(query, [roomId]);
        if (result.rows.length === 0) return null;
        return rowToDto(result.rows[0]);
    }

    async getByUserId(userId: bigint): Promise<ChatRoom[]> {
        const query = `
            SELECT * FROM chat_rooms
            WHERE user1_id = $1 OR user2_id = $1
            ORDER BY last_message_at DESC NULLS LAST, created_at DESC
        `;
        const result: QueryResult<ChatRoomRow> = await this.db.query(query, [userId]);
        return result.rows.map(rowToDto);
    }

    async updateLastMessage(roomId: bigint, content: string): Promise<void> {
        const query = `
            UPDATE chat_rooms
            SET last_message = $2, last_message_at = NOW()
            WHERE id = $1
        `;
        await this.db.query(query, [roomId, content]);
    }
}

export const chatRoomRepository = new ChatRoomRepository(DatabaseService.getInstance());
