import { UserBlock, UserBlockRow, UserBlockWithProfile, UserBlockWithProfileRow } from '../../types/user-block.types';
import { UserProfile } from '../../types/user-profile.types';

export function userBlockRowToDto(row: UserBlockRow): UserBlock {
    return {
        id: row.id,
        userId: row.user_id,
        blockedUserId: row.blocked_user_id,
        createdAt: row.created_at,
    };
}

export function userBlockWithProfileRowToDto(row: UserBlockWithProfileRow): UserBlockWithProfile {
    const blockedUserProfile: UserProfile | null = row.profile_id != null
        ? {
            id: row.profile_id,
            userId: row.blocked_user_id,
            fullName: row.full_name,
            gender: row.gender,
            age: row.age,
            experienceLevel: row.experience_level,
            pricePerDay: row.price_per_day !== null ? Number(row.price_per_day) : null,
            averageRating: row.average_rating !== null ? Number(row.average_rating) : 0,
            isDocumentVerified: row.is_document_verified ?? false,
            locationName: row.location_name,
            latitude: row.latitude !== null ? Number(row.latitude) : null,
            longitude: row.longitude !== null ? Number(row.longitude) : null,
            spokenLanguages: row.spoken_languages,
            profileImageUrl: row.profile_image_url,
            createdAt: row.profile_created_at!,
            updatedAt: row.profile_updated_at!,
        }
        : null;

    return {
        id: row.id,
        userId: row.user_id,
        blockedUserId: row.blocked_user_id,
        createdAt: row.created_at,
        blockedUserProfile,
    };
}
