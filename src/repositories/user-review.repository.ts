import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { UserReview, UserReviewRow, CreateUserReviewDto } from '../types/user-review.types';
import { userReviewRowToDto } from '../utils/mappers/user-review.mapper';

export type { UserReview, CreateUserReviewDto };

export class UserReviewRepository {
    constructor(private readonly db: DatabaseService) { }

    async create(reviewerUserId: bigint, dto: CreateUserReviewDto): Promise<UserReview> {
        const query = `
            INSERT INTO user_reviews (reviewer_user_id, reviewed_user_id, rating, review_text, related_match_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            reviewerUserId,
            dto.reviewedUserId,
            dto.rating,
            dto.reviewText ?? null,
            dto.relatedMatchId ?? null,
        ];
        const result: QueryResult<UserReviewRow> = await this.db.query(query, values);
        return userReviewRowToDto(result.rows[0]);
    }
}

export const userReviewRepository = new UserReviewRepository(DatabaseService.getInstance());
