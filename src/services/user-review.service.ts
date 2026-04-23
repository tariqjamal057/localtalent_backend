import { userReviewRepository, UserReviewRepository, UserReview, CreateUserReviewDto } from '../repositories/user-review.repository';

export class UserReviewService {
    constructor(private readonly userReviewRepository: UserReviewRepository) { }

    async create(reviewerUserId: bigint, dto: CreateUserReviewDto): Promise<UserReview> {
        return this.userReviewRepository.create(reviewerUserId, dto);
    }
}

export const userReviewService = new UserReviewService(userReviewRepository);
