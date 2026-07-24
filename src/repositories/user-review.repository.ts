import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { UserReview, UserReviewRow, CreateUserReviewDto } from '../types/user-review.types';
import { userReviewRowToDto } from '../utils/mappers/user-review.mapper';

export type { UserReview, CreateUserReviewDto };

export class UserReviewRepository {
    constructor(private readonly db: DatabaseService) { }

    async create(reviewerUserId: bigint, dto: CreateUserReviewDto): Promise<UserReview> {
        const query = `
            INSERT INTO user_reviews (reviewer_user_id, reviewed_user_id, rating, review_text)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [
            reviewerUserId,
            dto.reviewedUserId,
            dto.rating,
            dto.reviewText ?? null,
        ];
        const result: QueryResult<UserReviewRow> = await this.db.query(query, values);
        return userReviewRowToDto(result.rows[0]);
    }

    async getAverageRating(userId: bigint): Promise<number | null> {
        const query = `
            SELECT AVG(rating)::numeric(3,2) AS average_rating
            FROM user_reviews
            WHERE reviewed_user_id = $1
        `;
        const result = await this.db.query<{ average_rating: string | null }>(query, [userId]);
        const val = result.rows[0]?.average_rating;
        return val !== null && val !== undefined ? parseFloat(val) : null;
    }

    async getTotalReviews(userId: bigint): Promise<number> {
        const query = `
            SELECT COUNT(*)::int AS total
            FROM user_reviews
            WHERE reviewed_user_id = $1
        `;
        const result = await this.db.query<{ total: number }>(query, [userId]);
        return result.rows[0]?.total ?? 0;
    }
}

export const userReviewRepository = new UserReviewRepository(DatabaseService.getInstance());
