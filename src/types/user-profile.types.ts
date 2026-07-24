export interface UserProfile {
    id: bigint;
    userId: bigint;
    fullName: string | null;
    gender: number | null;
    age: number | null;
    experienceLevel: number | null;
    pricePerDay: number | null;
    averageRating: number;
    totalReviews: number;
    isDocumentVerified: boolean;
    locationName: string | null;
    latitude: number | null;
    longitude: number | null;
    spokenLanguages: string[] | null;
    profileImageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserProfileDto {
    fullName?: string | null;
    gender?: number | null;
    age?: number | null;
    experienceLevel?: number | null;
    pricePerDay?: number | null;
    locationName?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    spokenLanguages?: string[] | null;
    profileImageUrl?: string | null;
}

export interface UpdateUserProfileDto {
    fullName?: string | null;
    gender?: number | null;
    age?: number | null;
    experienceLevel?: number | null;
    pricePerDay?: number | null;
    locationName?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    spokenLanguages?: string[] | null;
    profileImageUrl?: string | null;
    averageRating?: number | null;
}

export interface UserProfileRow {
    id: bigint;
    user_id: bigint;
    full_name: string | null;
    gender: number | null;
    age: number | null;
    experience_level: number | null;
    price_per_day: string | null;
    average_rating: string;
    total_reviews: string;
    is_document_verified: boolean;
    location_name: string | null;
    latitude: string | null;
    longitude: string | null;
    spoken_languages: string[] | null;
    profile_image_url: string | null;
    created_at: Date;
    updated_at: Date;
}
