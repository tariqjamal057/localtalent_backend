import { UserAd, UserAdRow } from '../../types/ad.types';

export function userAdRowToDto(row: UserAdRow): UserAd {
    return {
        id: row.id,
        userId: row.user_id,
        mediaType: row.media_type,
        mediaUrl: row.media_url,
        title: row.title,
        description: row.description,
        impressionCount: row.impression_count,
        daysCount: row.days_count,
        lastShownAt: row.last_shown_at,
        expiresOn: row.expires_on,
        maxImpressions: row.max_impressions,
        maxDays: row.max_days,
        isLive: row.is_live,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
