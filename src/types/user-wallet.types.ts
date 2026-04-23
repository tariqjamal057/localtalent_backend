export interface UserWallet {
    id: bigint;
    userId: bigint;
    availableMatchCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserWalletRow {
    id: bigint;
    user_id: bigint;
    available_match_count: number;
    created_at: Date;
    updated_at: Date;
}
