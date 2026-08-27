import { UserReview, UserReviewRow, UserReviewWithReviewer, UserReviewWithReviewerRow } from '../../types/user-review.types';

export function userReviewRowToDto(row: UserReviewRow): UserReview {
    return {
        id: row.id,
        reviewerUserId: row.reviewer_user_id,
        reviewedUserId: row.reviewed_user_id,
        rating: row.rating,
        reviewText: row.review_text,
        createdAt: row.created_at,
    };
}

export function userReviewWithReviewerRowToDto(row: UserReviewWithReviewerRow): UserReviewWithReviewer {
    return {
        ...userReviewRowToDto(row),
        reviewerName: row.reviewer_name,
        reviewerProfileImage: row.reviewer_profile_image,
    };
}
