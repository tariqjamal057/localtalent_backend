export interface MatchCountPack {
    id: bigint;
    price: number;
    matchCount: number;
    offerPrice: number | null;
    priority: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface AdPack {
    id: bigint;
    price: number;
    offerPrice: number | null;
    priority: number;
    maxImpressions: number;
    maxDays: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface MatchCountPackRow {
    id: bigint;
    price: number;
    match_count: number;
    offer_price: number | null;
    priority: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface AdPackRow {
    id: bigint;
    price: number;
    offer_price: number | null;
    priority: number;
    max_impressions: number;
    max_days: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
