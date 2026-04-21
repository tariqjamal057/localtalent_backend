import { User, UserRow } from '../../types/user.types';

export function userRowToDto(row: UserRow): User {
    return {
        id: row.id,
        mobileNumber: row.mobile_number,
        countryCode: row.country_code,
        userType: row.user_type,
        appLanguageCode: row.app_language_code,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
