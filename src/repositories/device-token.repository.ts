import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { DeviceToken, DeviceTokenRow } from '../types/device-token.types';

export type { DeviceToken };

export class DeviceTokenRepository {
    constructor(private readonly db: DatabaseService) { }

    async upsert(userId: bigint, token: string, platform: string): Promise<void> {
        const query = `
            INSERT INTO device_tokens (user_id, token, platform)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, token)
            DO UPDATE SET platform = EXCLUDED.platform, updated_at = NOW()
        `;
        await this.db.query(query, [userId, token, platform]);
    }

    async deleteByToken(userId: bigint, token: string): Promise<boolean> {
        const result: QueryResult = await this.db.query(
            `DELETE FROM device_tokens WHERE user_id = $1 AND token = $2`,
            [userId, token]
        );
        return (result.rowCount ?? 0) > 0;
    }

    async deleteByTokenValue(token: string): Promise<void> {
        await this.db.query(`DELETE FROM device_tokens WHERE token = $1`, [token]);
    }

    async getTokensByUserId(userId: bigint): Promise<string[]> {
        const result: QueryResult<DeviceTokenRow> = await this.db.query(
            `SELECT * FROM device_tokens WHERE user_id = $1`,
            [userId]
        );
        return result.rows.map((row) => row.token);
    }
}

export const deviceTokenRepository = new DeviceTokenRepository(DatabaseService.getInstance());