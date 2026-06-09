import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { UserBlock, UserBlockRow, UserBlockWithProfile, UserBlockWithProfileRow } from '../types/user-block.types';
import { userBlockRowToDto, userBlockWithProfileRowToDto } from '../utils/mappers/user-block.mapper';

export type { UserBlock, UserBlockWithProfile };

export class UserBlockRepository {
    constructor(private readonly db: DatabaseService) { }

    async block(userId: bigint, blockedUserId: bigint): Promise<UserBlock> {
        const query = `
            INSERT INTO user_blocks (user_id, blocked_user_id)
            VALUES ($1, $2)
            RETURNING *
        `;
        const result: QueryResult<UserBlockRow> = await this.db.query(query, [userId, blockedUserId]);
        return userBlockRowToDto(result.rows[0]);
    }

    async unblock(userId: bigint, blockedUserId: bigint): Promise<boolean> {
        const query = `
            DELETE FROM user_blocks
            WHERE user_id = $1 AND blocked_user_id = $2
        `;
        const result = await this.db.query(query, [userId, blockedUserId]);
        return (result.rowCount ?? 0) > 0;
    }

    async exists(userId: bigint, blockedUserId: bigint): Promise<boolean> {
        const query = `
            SELECT 1 FROM user_blocks
            WHERE user_id = $1 AND blocked_user_id = $2
        `;
        const result = await this.db.query(query, [userId, blockedUserId]);
        return result.rows.length > 0;
    }

    async getAllByUserId(userId: bigint): Promise<UserBlock[]> {
        const query = `
            SELECT *
            FROM user_blocks
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const result: QueryResult<UserBlockRow> = await this.db.query(query, [userId]);
        return result.rows.map(userBlockRowToDto);
    }

    async getAllWithProfilesByUserId(userId: bigint): Promise<UserBlockWithProfile[]> {
        const query = `
            SELECT
                ub.id,
                ub.user_id,
                ub.blocked_user_id,
                ub.created_at,
                up.id            AS profile_id,
                up.full_name,
                up.gender,
                up.age,
                up.experience_level,
                up.price_per_day,
                up.average_rating,
                up.is_document_verified,
                up.location_name,
                up.latitude,
                up.longitude,
                up.spoken_languages,
                up.profile_image_url,
                up.created_at    AS profile_created_at,
                up.updated_at    AS profile_updated_at
            FROM user_blocks ub
            LEFT JOIN user_profiles up ON up.user_id = ub.blocked_user_id
            WHERE ub.user_id = $1
            ORDER BY ub.created_at DESC
        `;
        const result: QueryResult<UserBlockWithProfileRow> = await this.db.query(query, [userId]);
        return result.rows.map(userBlockWithProfileRowToDto);
    }
}

export const userBlockRepository = new UserBlockRepository(DatabaseService.getInstance());
