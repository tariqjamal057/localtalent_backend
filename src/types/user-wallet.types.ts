export interface UserWallet {
    id: bigint;
    userId: bigint;
    availableMatchCount: number;
    freeMatchCountAvailable: number;
    videoRequestCountAvailable: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserWalletRow {
    id: bigint;
    user_id: bigint;
    available_match_count: number;
    free_match_count_available: number;
    video_request_count_available: number;
    created_at: Date;
    updated_at: Date;
}
