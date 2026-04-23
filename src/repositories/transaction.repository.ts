import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import {
    Transaction,
    TransactionRow,
    CreateTransactionDto,
    UpdateTransactionDto,
} from '../types/payment.types';
import { transactionRowToDto } from '../utils/mappers/payment.mapper';

export type { Transaction, CreateTransactionDto, UpdateTransactionDto };

export class TransactionRepository {
    constructor(private readonly db: DatabaseService) { }

    async create(dto: CreateTransactionDto): Promise<Transaction> {
        const query = `
            INSERT INTO transactions (
                user_id, payment_provider, provider_order_id, payment_order_id,
                amount, tax, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            dto.userId,
            dto.paymentProvider,
            dto.providerOrderId ?? null,
            dto.paymentOrderId,
            dto.amount,
            dto.tax,
            dto.status,
        ];
        const result: QueryResult<TransactionRow> = await this.db.query(query, values);
        return transactionRowToDto(result.rows[0]);
    }

    async getById(id: bigint): Promise<Transaction | null> {
        const query = `
            SELECT *
            FROM transactions
            WHERE id = $1
        `;
        const result: QueryResult<TransactionRow> = await this.db.query(query, [id]);
        if (result.rows.length === 0) return null;
        return transactionRowToDto(result.rows[0]);
    }

    async getByPaymentOrderId(paymentOrderId: bigint): Promise<Transaction[]> {
        const query = `
            SELECT *
            FROM transactions
            WHERE payment_order_id = $1
            ORDER BY created_at DESC
        `;
        const result: QueryResult<TransactionRow> = await this.db.query(query, [paymentOrderId]);
        return result.rows.map(row => transactionRowToDto(row));
    }

    async update(id: bigint, dto: UpdateTransactionDto): Promise<void> {
        const query = `
            UPDATE transactions
            SET status = $1,
                provider_order_id = COALESCE($2, provider_order_id),
                updated_at = NOW()
            WHERE id = $3
        `;
        await this.db.query(query, [dto.status, dto.providerOrderId ?? null, id]);
    }
}

export const transactionRepository = new TransactionRepository(DatabaseService.getInstance());
