import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { UserReview, UserReviewRow, CreateUserReviewDto, UserReviewWithReviewerRow, PaginatedUserReviews } from '../types/user-review.types';
import { userReviewRowToDto, userReviewWithReviewerRowToDto } from '../utils/mappers/user-review.mapper';

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

    async getReviewsByUserId(userId: bigint, page: number, limit: number): Promise<PaginatedUserReviews> {
        const offset = (page - 1) * limit;
        const query = `
            SELECT
                ur.id,
                ur.reviewer_user_id,
                ur.reviewed_user_id,
                ur.rating,
                ur.review_text,
                ur.created_at,
                up.full_name AS reviewer_name,
                up.profile_image_url AS reviewer_profile_image
            FROM user_reviews ur
            JOIN user_profiles up ON up.user_id = ur.reviewer_user_id
            WHERE ur.reviewed_user_id = $1
            ORDER BY ur.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result: QueryResult<UserReviewWithReviewerRow> = await this.db.query(query, [userId, limit, offset]);

        const countQuery = `SELECT COUNT(*)::int AS total FROM user_reviews WHERE reviewed_user_id = $1`;
        const countResult = await this.db.query<{ total: number }>(countQuery, [userId]);
        const total = countResult.rows[0]?.total ?? 0;

        return {
            data: result.rows.map(row => userReviewWithReviewerRowToDto(row)),
            total,
            page,
            limit,
        };
    }
}

export const userReviewRepository = new UserReviewRepository(DatabaseService.getInstance());
