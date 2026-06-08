import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import {
    PaymentOrder,
    PaymentOrderRow,
    CreatePaymentOrderDto,
    UpdatePaymentOrderDto,
} from '../types/payment.types';
import { paymentOrderRowToDto } from '../utils/mappers/payment.mapper';

export type { PaymentOrder, CreatePaymentOrderDto, UpdatePaymentOrderDto };

export class PaymentOrderRepository {
    constructor(private readonly db: DatabaseService) { }

    async create(dto: CreatePaymentOrderDto): Promise<PaymentOrder> {
        const query = `
            INSERT INTO payment_orders (
                user_id, amount, tax, status, purpose, product_id,
                purchased_match_count, purchased_ad_days, purchased_ad_impressions,
                bonus_match_count, bonus_ad_days, bonus_ad_impressions, promocode_id, order_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;
        const values = [
            dto.userId,
            dto.amount,
            dto.tax,
            dto.status,
            dto.purpose,
            dto.productId ?? null,
            dto.purchasedMatchCount ?? null,
            dto.purchasedAdDays ?? null,
            dto.purchasedAdImpressions ?? null,
            dto.bonusMatchCount ?? null,
            dto.bonusAdDays ?? null,
            dto.bonusAdImpressions ?? null,
            dto.promocodeId ?? null,
            dto.orderId,
        ];
        const result: QueryResult<PaymentOrderRow> = await this.db.query(query, values);
        return paymentOrderRowToDto(result.rows[0]);
    }

    async getById(id: bigint): Promise<PaymentOrder | null> {
        const query = `
            SELECT *
            FROM payment_orders
            WHERE id = $1
        `;
        const result: QueryResult<PaymentOrderRow> = await this.db.query(query, [id]);
        if (result.rows.length === 0) return null;
        return paymentOrderRowToDto(result.rows[0]);
    }

    async getByUserId(userId: bigint): Promise<PaymentOrder[]> {
        const query = `
            SELECT *
            FROM payment_orders
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const result: QueryResult<PaymentOrderRow> = await this.db.query(query, [userId]);
        return result.rows.map(row => paymentOrderRowToDto(row));
    }

    async getByOrderId(orderId: string): Promise<PaymentOrder | null> {
        const query = `
            SELECT *
            FROM payment_orders
            WHERE order_id = $1
        `;
        const result: QueryResult<PaymentOrderRow> = await this.db.query(query, [orderId]);
        if (result.rows.length === 0) return null;
        return paymentOrderRowToDto(result.rows[0]);
    }

    async updateStatus(id: bigint, dto: UpdatePaymentOrderDto): Promise<void> {
        const query = `
            UPDATE payment_orders
            SET status = $1,
                updated_at = NOW()
            WHERE id = $2
        `;
        await this.db.query(query, [dto.status, id]);
    }
}

export const paymentOrderRepository = new PaymentOrderRepository(DatabaseService.getInstance());
