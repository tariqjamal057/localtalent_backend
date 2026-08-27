import { userReviewRepository, UserReviewRepository, UserReview, CreateUserReviewDto } from '../repositories/user-review.repository';
import { PaginatedUserReviews, UserReviewWithReviewer } from '../types/user-review.types';

export type { PaginatedUserReviews, UserReviewWithReviewer };

export class UserReviewService {
    constructor(private readonly userReviewRepository: UserReviewRepository) { }

    async create(reviewerUserId: bigint, dto: CreateUserReviewDto): Promise<UserReview> {
        return this.userReviewRepository.create(reviewerUserId, dto);
    }

    async getAverageRatingOfUser(userId: bigint): Promise<number | null> {
        return this.userReviewRepository.getAverageRating(userId);
    }

    async getTotalReviewsOfUser(userId: bigint): Promise<number> {
        return this.userReviewRepository.getTotalReviews(userId);
    }

    async getReviewsByUserId(userId: bigint, page: number, limit: number): Promise<PaginatedUserReviews> {
        return this.userReviewRepository.getReviewsByUserId(userId, page, limit);
    }
}

export const userReviewService = new UserReviewService(userReviewRepository);
