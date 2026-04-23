import { UserProfile } from './user-profile.types';

export interface UserBlock {
    id: bigint;
    userId: bigint;
    blockedUserId: bigint;
    createdAt: Date;
}

export interface UserBlockWithProfile extends UserBlock {
    blockedUserProfile: UserProfile | null;
}

export interface UserBlockRow {
    id: bigint;
    user_id: bigint;
    blocked_user_id: bigint;
    created_at: Date;
}

export interface UserBlockWithProfileRow extends UserBlockRow {
    profile_id: bigint | null;
    full_name: string | null;
    gender: number | null;
    age: number | null;
    experience_level: number | null;
    price_per_day: string | null;
    average_rating: string | null;
    is_document_verified: boolean | null;
    location_name: string | null;
    latitude: string | null;
    longitude: string | null;
    spoken_languages: string[] | null;
    profile_created_at: Date | null;
    profile_updated_at: Date | null;
}
