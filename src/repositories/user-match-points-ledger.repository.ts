import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { UserMatchPointsLedgerEntry, UserMatchPointsLedgerRow, CreateLedgerEntryDto } from '../types/user-match-points-ledger.types';

export type { UserMatchPointsLedgerEntry, CreateLedgerEntryDto };

function ledgerRowToDto(row: UserMatchPointsLedgerRow): UserMatchPointsLedgerEntry {
    return {
        id: row.id,
        userId: row.user_id,
        transactionId: row.transaction_id,
        transactionType: row.transaction_type,
        transactionPoints: row.transaction_points,
        createdAt: row.created_at,
    };
}

export class UserMatchPointsLedgerRepository {
    constructor(private readonly db: DatabaseService) { }

    async create(dto: CreateLedgerEntryDto): Promise<UserMatchPointsLedgerEntry> {
        const query = `
            INSERT INTO user_match_points_ledger (user_id, transaction_id, transaction_type, transaction_points)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [dto.userId, dto.transactionId, dto.transactionType, dto.transactionPoints];
        const result: QueryResult<UserMatchPointsLedgerRow> = await this.db.query(query, values);
        return ledgerRowToDto(result.rows[0]);
    }

    async getHistoryByUserId(userId: bigint): Promise<UserMatchPointsLedgerEntry[]> {
        const query = `
            SELECT *
            FROM user_match_points_ledger
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const result: QueryResult<UserMatchPointsLedgerRow> = await this.db.query(query, [userId]);
        return result.rows.map(ledgerRowToDto);
    }
}

export const userMatchPointsLedgerRepository = new UserMatchPointsLedgerRepository(DatabaseService.getInstance());
