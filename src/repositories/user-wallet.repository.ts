import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { UserWallet, UserWalletRow } from '../types/user-wallet.types';
import { userWalletRowToDto } from '../utils/mappers/user-wallet.mapper';

export type { UserWallet };

export class UserWalletRepository {
    constructor(private readonly db: DatabaseService) { }

    async getByUserId(userId: bigint): Promise<UserWallet | null> {
        const query = `
            SELECT *
            FROM user_wallets
            WHERE user_id = $1
        `;
        const result: QueryResult<UserWalletRow> = await this.db.query(query, [userId]);
        if (result.rows.length === 0) return null;
        return userWalletRowToDto(result.rows[0]);
    }

    async insert(
        userId: bigint,
        data?: Partial<Pick<UserWallet, 'availableMatchCount' | 'freeMatchCountAvailable' | 'videoRequestCountAvailable'>>
    ): Promise<UserWallet> {
        const fields = ['user_id'];
        const placeholders = ['$1'];
        const values: unknown[] = [userId];
        let idx = 2;

        if (data?.availableMatchCount !== undefined) {
            fields.push('available_match_count');
            placeholders.push(`$${idx++}`);
            values.push(data.availableMatchCount);
        }
        if (data?.freeMatchCountAvailable !== undefined) {
            fields.push('free_match_count_available');
            placeholders.push(`$${idx++}`);
            values.push(data.freeMatchCountAvailable);
        }
        if (data?.videoRequestCountAvailable !== undefined) {
            fields.push('video_request_count_available');
            placeholders.push(`$${idx++}`);
            values.push(data.videoRequestCountAvailable);
        }

        const query = `
            INSERT INTO user_wallets (${fields.join(', ')})
            VALUES (${placeholders.join(', ')})
            RETURNING *
        `;

        const result: QueryResult<UserWalletRow> = await this.db.query(query, values);
        return userWalletRowToDto(result.rows[0]);
    }

    async incrementMatchPackCredits(userId: bigint, matchCount: number, videoRequestCount: number): Promise<void> {
        const query = `
            UPDATE user_wallets
            SET available_match_count = available_match_count + $2,
                video_request_count_available = video_request_count_available + $3,
                updated_at = NOW()
            WHERE user_id = $1
        `;
        await this.db.query(query, [userId, matchCount, videoRequestCount]);
    }

    async updateByUserId(
        userId: bigint,
        data: Partial<Pick<UserWallet, 'availableMatchCount' | 'freeMatchCountAvailable' | 'videoRequestCountAvailable'>>
    ): Promise<UserWallet | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let idx = 1;

        if (data.availableMatchCount !== undefined) {
            fields.push(`available_match_count = $${idx++}`);
            values.push(data.availableMatchCount);
        }
        if (data.freeMatchCountAvailable !== undefined) {
            fields.push(`free_match_count_available = $${idx++}`);
            values.push(data.freeMatchCountAvailable);
        }
        if (data.videoRequestCountAvailable !== undefined) {
            fields.push(`video_request_count_available = $${idx++}`);
            values.push(data.videoRequestCountAvailable);
        }

        if (fields.length === 0) return this.getByUserId(userId);

        fields.push(`updated_at = NOW()`);
        values.push(userId);

        const query = `
            UPDATE user_wallets
            SET ${fields.join(', ')}
            WHERE user_id = $${idx}
            RETURNING *
        `;
        const result: QueryResult<UserWalletRow> = await this.db.query(query, values);
        if (result.rows.length === 0) return null;
        return userWalletRowToDto(result.rows[0]);
    }
}

export const userWalletRepository = new UserWalletRepository(DatabaseService.getInstance());
