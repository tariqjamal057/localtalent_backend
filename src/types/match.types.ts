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
}