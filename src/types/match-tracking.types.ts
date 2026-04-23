export interface MatchTracking {
    id: bigint;
    matchId: bigint;
    state: number;
    createdAt: Date;
}

export interface CreateMatchTrackingDto {
    matchId: bigint;
    state: number;
}

export interface MatchTrackingRow {
    id: bigint;
    match_id: bigint;
    state: number;
    created_at: Date;
}
