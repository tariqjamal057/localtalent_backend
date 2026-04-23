import { Promocode, PromocodeRow } from '../../types/promocode.types';

export function promocodeRowToDto(row: PromocodeRow): Promocode {
    return {
        id: row.id,
        code: row.code,
        promoType: row.promo_type,
        multiplier: row.multiplier !== null ? Number(row.multiplier) : null,
        isActive: row.is_active,
        expiresOn: row.expires_on,
        isReferralCode: row.is_referral_code,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
