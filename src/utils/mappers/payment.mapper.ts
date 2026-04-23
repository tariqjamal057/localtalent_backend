import {
    PaymentOrder,
    PaymentOrderRow,
    Transaction,
    TransactionRow,
} from '../../types/payment.types';

export function paymentOrderRowToDto(row: PaymentOrderRow): PaymentOrder {
    return {
        id: row.id,
        userId: row.user_id,
        amount: Number(row.amount),
        tax: Number(row.tax),
        status: row.status,
        purpose: row.purpose,
        productId: row.product_id,
        purchasedMatchCount: row.purchased_match_count,
        purchasedAdDays: row.purchased_ad_days,
        purchasedAdImpressions: row.purchased_ad_impressions,
        bonusMatchCount: row.bonus_match_count,
        bonusAdDays: row.bonus_ad_days,
        bonusAdImpressions: row.bonus_ad_impressions,
        promocodeId: row.promocode_id,
        orderId: row.order_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function transactionRowToDto(row: TransactionRow): Transaction {
    return {
        id: row.id,
        userId: row.user_id,
        paymentProvider: row.payment_provider,
        providerOrderId: row.provider_order_id,
        paymentOrderId: row.payment_order_id,
        amount: Number(row.amount),
        tax: Number(row.tax),
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
