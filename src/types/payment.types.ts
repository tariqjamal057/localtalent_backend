export interface PaymentOrder {
    id: bigint;
    userId: bigint;
    amount: number;
    tax: number;
    status: number;
    purpose: number;
    productId: bigint | null;
    purchasedMatchCount: number | null;
    purchasedAdDays: number | null;
    purchasedAdImpressions: number | null;
    bonusMatchCount: number | null;
    bonusAdDays: number | null;
    bonusAdImpressions: number | null;
    promocodeId: bigint | null;
    orderId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentOrderRow {
    id: bigint;
    user_id: bigint;
    amount: number;
    tax: number;
    status: number;
    purpose: number;
    product_id: bigint | null;
    purchased_match_count: number | null;
    purchased_ad_days: number | null;
    purchased_ad_impressions: number | null;
    bonus_match_count: number | null;
    bonus_ad_days: number | null;
    bonus_ad_impressions: number | null;
    promocode_id: bigint | null;
    order_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreatePaymentOrderDto {
    userId: bigint;
    amount: number;
    tax: number;
    status: number;
    purpose: number;
    productId?: bigint;
    purchasedMatchCount?: number;
    purchasedAdDays?: number;
    purchasedAdImpressions?: number;
    bonusMatchCount?: number;
    bonusAdDays?: number;
    bonusAdImpressions?: number;
    promocodeId?: bigint;
    orderId: string;
}

export interface UpdatePaymentOrderDto {
    status: number;
}

export interface PaginatedPaymentOrders {
    data: PaymentOrder[];
    total: number;
    page: number;
    limit: number;
}

export interface Transaction {
    id: bigint;
    userId: bigint;
    paymentProvider: number;
    providerOrderId: string | null;
    paymentOrderId: bigint;
    amount: number;
    tax: number;
    status: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface TransactionRow {
    id: bigint;
    user_id: bigint;
    payment_provider: number;
    provider_order_id: string | null;
    payment_order_id: bigint;
    amount: number;
    tax: number;
    status: number;
    created_at: Date;
    updated_at: Date;
}

export interface CreateTransactionDto {
    userId: bigint;
    paymentProvider: number;
    providerOrderId?: string;
    paymentOrderId: bigint;
    amount: number;
    tax: number;
    status: number;
}

export interface UpdateTransactionDto {
    status: number;
    providerOrderId?: string;
}
