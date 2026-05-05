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
    provider_call_id?: string;
    total_users?: number;
    proposal_accepted_count?: number;
    finalState?: number;
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
}
