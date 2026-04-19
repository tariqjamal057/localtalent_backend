import { UserProfile, UserProfileRow } from '../../types/user-profile.types';

export function userProfileRowToDto(row: UserProfileRow): UserProfile {
    return {
        id: row.id,
        userId: row.user_id,
        fullName: row.full_name,
        gender: row.gender,
        age: row.age,
        experienceLevel: row.experience_level,
        pricePerDay: row.price_per_day !== null ? Number(row.price_per_day) : null,
        averageRating: Number(row.average_rating),
        isDocumentVerified: row.is_document_verified,
        locationName: row.location_name,
        latitude: row.latitude !== null ? Number(row.latitude) : null,
        longitude: row.longitude !== null ? Number(row.longitude) : null,
        spokenLanguages: row.spoken_languages,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
