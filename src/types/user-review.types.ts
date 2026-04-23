export interface UserReview {
    id: bigint;
    reviewerUserId: bigint;
    reviewedUserId: bigint;
    rating: number;
    reviewText: string | null;
    relatedMatchId: bigint | null;
    createdAt: Date;
}

export interface CreateUserReviewDto {
    reviewedUserId: bigint;
    rating: number;
    reviewText?: string | null;
    relatedMatchId?: bigint | null;
}

export interface UserReviewRow {
    id: bigint;
    reviewer_user_id: bigint;
    reviewed_user_id: bigint;
    rating: number;
    review_text: string | null;
    related_match_id: bigint | null;
    created_at: Date;
}
