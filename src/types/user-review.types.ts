export interface UserReview {
    id: bigint;
    reviewerUserId: bigint;
    reviewedUserId: bigint;
    rating: number;
    reviewText: string | null;
    createdAt: Date;
}

export interface UserReviewWithReviewer extends UserReview {
    reviewerName: string | null;
    reviewerProfileImage: string | null;
}

export interface PaginatedUserReviews {
    data: UserReviewWithReviewer[];
    total: number;
    page: number;
    limit: number;
}

export interface CreateUserReviewDto {
    reviewedUserId: bigint;
    rating: number;
    reviewText?: string | null;
}

export interface UserReviewRow {
    id: bigint;
    reviewer_user_id: bigint;
    reviewed_user_id: bigint;
    rating: number;
    review_text: string | null;
    created_at: Date;
}

export interface UserReviewWithReviewerRow extends UserReviewRow {
    reviewer_name: string | null;
    reviewer_profile_image: string | null;
}
