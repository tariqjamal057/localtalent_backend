export interface DeviceToken {
    id: bigint;
    userId: bigint;
    token: string;
    platform: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DeviceTokenRow {
    id: bigint;
    user_id: bigint;
    token: string;
    platform: string;
    created_at: Date;
    updated_at: Date;
}