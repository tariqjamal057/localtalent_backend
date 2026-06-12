import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { UserAd, UserAdRow, CreateAdDto, UpdateAdDto, PaginatedAds } from '../types/ad.types';
import { userAdRowToDto } from '../utils/mappers/ad.mapper';

export type { UserAd, CreateAdDto, UpdateAdDto, PaginatedAds };

export class AdRepository {
    constructor(private readonly db: DatabaseService) { }

    async getAdsByUserId(userId: bigint, page: number, limit: number): Promise<PaginatedAds> {
        const offset = (page - 1) * limit;
        const query = `
            SELECT *, COUNT(*) OVER() AS total_count
            FROM user_ads
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result: QueryResult<UserAdRow & { total_count: string }> = await this.db.query(query, [userId, limit, offset]);
        const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;
        return {
            data: result.rows.map(row => userAdRowToDto(row)),
            total,
            page,
            limit,
        };
    }

    async getActiveAds(page: number, limit: number): Promise<PaginatedAds> {
        const offset = (page - 1) * limit;
        const query = `
            SELECT *, COUNT(*) OVER() AS total_count
            FROM user_ads
            WHERE is_live = TRUE
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result: QueryResult<UserAdRow & { total_count: string }> = await this.db.query(query, [limit, offset]);
        const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;
        return {
            data: result.rows.map(row => userAdRowToDto(row)),
            total,
            page,
            limit,
        };
    }

    async getAdsForDisplay(userId: bigint, page: number, limit: number): Promise<PaginatedAds> {
        const offset = (page - 1) * limit;
        const query = `
            SELECT *, COUNT(*) OVER() AS total_count
            FROM user_ads
            WHERE is_live = TRUE
              AND expires_on > NOW()
              AND user_id != $1
            ORDER BY impression_count ASC
            LIMIT $2 OFFSET $3
        `;
        const result: QueryResult<UserAdRow & { total_count: string }> = await this.db.query(query, [userId, limit, offset]);
        const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;
        return {
            data: result.rows.map(row => userAdRowToDto(row)),
            total,
            page,
            limit,
        };
    }

    async incrementImpressionCount(id: bigint): Promise<void> {
        const query = `
            UPDATE user_ads
            SET impression_count = impression_count + 1,
                last_shown_at = NOW()
            WHERE id = $1
        `;
        await this.db.query(query, [id]);
    }

    async activateAd(id: bigint, maxDays: number, maxImpressions: number): Promise<UserAd | null> {
        const query = `
            UPDATE user_ads
            SET is_live = TRUE,
                max_days = $2,
                max_impressions = $3,
                expires_on = NOW() + ($2 * INTERVAL '1 day')
            WHERE id = $1
            RETURNING *
        `;
        const result: QueryResult<UserAdRow> = await this.db.query(query, [id, maxDays, maxImpressions]);
        if (result.rows.length === 0) return null;
        return userAdRowToDto(result.rows[0]);
    }

    async updateAdStatus(id: bigint, isLive: boolean): Promise<UserAd | null> {
        const query = `
            UPDATE user_ads
            SET is_live = $1
            WHERE id = $2
            RETURNING *
        `;
        const result: QueryResult<UserAdRow> = await this.db.query(query, [isLive, id]);
        if (result.rows.length === 0) return null;
        return userAdRowToDto(result.rows[0]);
    }

    async create(userId: bigint, dto: CreateAdDto): Promise<UserAd> {
        const query = `
            INSERT INTO user_ads (
                user_id, media_type, media_url, title, description
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            userId,
            dto.mediaType,
            dto.mediaUrl,
            dto.title ?? null,
            dto.description ?? null,
        ];
        const result: QueryResult<UserAdRow> = await this.db.query(query, values);
        return userAdRowToDto(result.rows[0]);
    }

    async updateById(id: bigint, dto: UpdateAdDto): Promise<UserAd | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let idx = 1;

        if (dto.mediaType !== undefined) { fields.push(`media_type = $${idx++}`); values.push(dto.mediaType); }
        if (dto.mediaUrl !== undefined) { fields.push(`media_url = $${idx++}`); values.push(dto.mediaUrl); }
        if (dto.title !== undefined) { fields.push(`title = $${idx++}`); values.push(dto.title); }
        if (dto.description !== undefined) { fields.push(`description = $${idx++}`); values.push(dto.description); }

        if (fields.length === 0) return this.getById(id);

        values.push(id);
        const query = `
            UPDATE user_ads
            SET ${fields.join(', ')}
            WHERE id = $${idx}
            RETURNING *
        `;
        const result: QueryResult<UserAdRow> = await this.db.query(query, values);
        if (result.rows.length === 0) return null;
        return userAdRowToDto(result.rows[0]);
    }

    async getById(id: bigint): Promise<UserAd | null> {
        const query = `
            SELECT *
            FROM user_ads
            WHERE id = $1
        `;
        const result: QueryResult<UserAdRow> = await this.db.query(query, [id]);
        if (result.rows.length === 0) return null;
        return userAdRowToDto(result.rows[0]);
    }
}

export const adRepository = new AdRepository(DatabaseService.getInstance());
