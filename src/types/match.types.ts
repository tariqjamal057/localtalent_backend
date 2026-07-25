import { MatchRequest } from "./socket-data.type";

export interface Match {
    id: bigint;
    recruiterUserId: bigint;
    candidateUserId: bigint;
    recruiterFormData: MatchRequest | null;
    candidateFormData: MatchRequest | null;
    finalState: number;
    createdAt: Date;
    updatedAt: Date;
    totalUsers: number;
    proposalAcceptedCount: number;
    providerCallId?: string;
    callEndedBy?: number;
    callType?: number;
    recruiterReviewId?: bigint | null;
    candidateReviewId?: bigint | null;
}

export interface CreateMatchDto {
    recruiterUserId: bigint;
    candidateUserId: bigint;
    recruiterFormData?: MatchRequest | null;
    candidateFormData?: MatchRequest | null;
    finalState: number;
    totalUsers: number;
}

export interface UpdateMatchDto {
    providerCallId?: string;
    totalUsers?: number;
    proposalAcceptedCount?: number;
    finalState?: number;
    callEndedBy?: number;
    callType?: number;
    recruiterReviewId?: bigint | null;
    candidateReviewId?: bigint | null;
}

export interface MatchRow {
    id: bigint;
    recruiter_user_id: bigint;
    candidate_user_id: bigint;
    recruiter_form_data: MatchRequest | null;
    candidate_form_data: MatchRequest | null;
    final_state: number;
    created_at: Date;
    updated_at: Date;
    total_users: number;
    proposal_accepted_count: number;
    provider_call_id?: string;
    call_ended_by?: number;
    call_type?: number;
    recruiter_review_id?: bigint | null;
    candidate_review_id?: bigint | null;
}

export interface PendingReviewMatchRow {
    id: bigint;
    recruiter_user_id: bigint;
    candidate_user_id: bigint;
    created_at: Date;
    other_user_full_name: string | null;
    other_user_profile_image_url: string | null;
}

export interface PendingReviewMatch {
    matchId: bigint;
    otherUserId: bigint;
    otherUserFullName: string | null;
    otherUserProfileImageUrl: string | null;
    createdAt: Date;
}

export interface UserLocation {
    latitude: number;
    longitude: number;
}

export interface AcceptedMatchItem {
    matchId: bigint;
    otherUserId: bigint;
    otherUserFullName: string | null;
    otherUserProfileImageUrl: string | null;
    finalState: number;
    createdAt: Date;
    updatedAt: Date;
    userLocation: UserLocation | null;
    otherUserLocation: UserLocation | null;
}

export interface AcceptedMatchRow {
    id: bigint;
    recruiter_user_id: bigint;
    candidate_user_id: bigint;
    final_state: number;
    created_at: Date;
    updated_at: Date;
    other_user_full_name: string | null;
    other_user_profile_image_url: string | null;
    total_count: string;
    user_latitude: string | null;
    user_longitude: string | null;
    other_user_latitude: string | null;
    other_user_longitude: string | null;
}

export interface PaginatedAcceptedMatches {
    data: AcceptedMatchItem[];
    total: number;
    page: number;
    limit: number;
}

export interface TopMatch {
    matchId: number;
    userId: number;
    name: string;
    age: number;
    experience: number;
    spokenLanguageIds: number[];
    gender: number;

    rate: number;
    rateType: number;

    availableTiming: number;
    availabilityType: number;

    categoryLevelTwo: string;
    categoryLevelThree: string;

    latitude: number;
    longitude: number;
    locationName: string | null;
}