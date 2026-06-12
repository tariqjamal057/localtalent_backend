import { AD_STATUS } from "../enums/ad";

export interface UserAd {
    id: bigint;
    userId: bigint;
    mediaType: number;
    mediaUrl: string;
    title: string | null;
    description: string | null;
    impressionCount: number;
    daysCount: number;
    lastShownAt: Date | null;
    expiresOn: Date | null;
    maxImpressions: number;
    maxDays: number;
    isLive: boolean;
    createdAt: Date;
    updatedAt: Date;
    status: AD_STATUS
}

export interface UserAdRow {
    id: bigint;
    user_id: bigint;
    media_type: number;
    media_url: string;
    title: string | null;
    description: string | null;
    impression_count: number;
    days_count: number;
    last_shown_at: Date | null;
    expires_on: Date | null;
    max_impressions: number;
    max_days: number;
    is_live: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateAdDto {
    mediaType: number;
    mediaUrl: string;
    title?: string | null;
    description?: string | null;
    adPackId?: string;
    shouldAutoExecuteOrder?: boolean;
    promoCode?: string;
    userPlatform?: string;
    adId?: number
}

export interface UpdateAdDto {
    mediaType?: number;
    mediaUrl?: string;
    title?: string | null;
    description?: string | null;
}

export interface PaginatedAds {
    data: UserAd[];
    total: number;
    page: number;
    limit: number;
}
