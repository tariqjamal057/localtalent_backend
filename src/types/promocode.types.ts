export interface Promocode {
    id: bigint;
    code: string;
    promoType: number;
    multiplier: number | null;
    isActive: boolean;
    expiresOn: Date | null;
    isReferralCode: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PromocodeRow {
    id: bigint;
    code: string;
    promo_type: number;
    multiplier: number | null;
    is_active: boolean;
    expires_on: Date | null;
    is_referral_code: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreatePromocodeDto {
    code: string;
    promoType: number;
    multiplier?: number;
    isActive?: boolean;
    expiresOn?: Date;
    isReferralCode?: boolean;
}

export interface UpdatePromocodeDto {
    isActive?: boolean;
    multiplier?: number;
    expiresOn?: Date;
}
