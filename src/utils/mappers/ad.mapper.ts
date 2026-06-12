import { AD_STATUS } from '../../enums/ad';
import { UserAd, UserAdRow } from '../../types/ad.types';

function getAdStaus(row: UserAdRow): AD_STATUS {
    if (!row.expires_on) {
        return AD_STATUS.PAYMENT_PENDING
    } else if (row.expires_on > new Date(Date.now()) && row.impression_count < row.max_impressions) {
        return AD_STATUS.LIVE;
    } else {
        return AD_STATUS.EXPIRED
    }
}

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
        status: getAdStaus(row)
    };
}
