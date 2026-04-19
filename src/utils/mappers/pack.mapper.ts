import { AdPack, AdPackRow, MatchCountPack, MatchCountPackRow } from '../../types/pack.types';

export function matchCountPackRowToDto(row: MatchCountPackRow): MatchCountPack {
    return {
        id: row.id,
        price: Number(row.price),
        matchCount: row.match_count,
        offerPrice: row.offer_price !== null ? Number(row.offer_price) : null,
        priority: row.priority,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function adPackRowToDto(row: AdPackRow): AdPack {
    return {
        id: row.id,
        price: Number(row.price),
        offerPrice: row.offer_price !== null ? Number(row.offer_price) : null,
        priority: row.priority,
        maxImpressions: row.max_impressions,
        maxDays: row.max_days,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
