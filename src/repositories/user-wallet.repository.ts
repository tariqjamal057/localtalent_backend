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
}

export const userWalletRepository = new UserWalletRepository(DatabaseService.getInstance());
