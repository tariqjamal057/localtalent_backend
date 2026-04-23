export interface Match {
    id: bigint;
    recruiterUserId: bigint;
    candidateUserId: bigint;
    callInitiatedBy: bigint | null;
    recruiterFormData: Record<string, unknown> | null;
    candidateFormData: Record<string, unknown> | null;
    finalState: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateMatchDto {
    recruiterUserId: bigint;
    candidateUserId: bigint;
    callInitiatedBy?: bigint | null;
    recruiterFormData?: Record<string, unknown> | null;
    candidateFormData?: Record<string, unknown> | null;
    finalState: number;
}

export interface MatchRow {
    id: bigint;
    recruiter_user_id: bigint;
    candidate_user_id: bigint;
    call_initiated_by: bigint | null;
    recruiter_form_data: Record<string, unknown> | null;
    candidate_form_data: Record<string, unknown> | null;
    final_state: number;
    created_at: Date;
    updated_at: Date;
}
