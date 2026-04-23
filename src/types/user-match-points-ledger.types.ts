export interface UserMatchPointsLedgerEntry {
    id: bigint;
    userId: bigint;
    transactionId: bigint;
    transactionType: number;
    transactionPoints: number;
    createdAt: Date;
}

export interface CreateLedgerEntryDto {
    userId: bigint;
    transactionId: bigint;
    transactionType: number;
    transactionPoints: number;
}

export interface UserMatchPointsLedgerRow {
    id: bigint;
    user_id: bigint;
    transaction_id: bigint;
    transaction_type: number;
    transaction_points: number;
    created_at: Date;
}
