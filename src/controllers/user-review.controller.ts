import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { userReviewService, UserReviewService } from '../services/user-review.service';
import { sendResponse } from '../utils/response';
import { MESSAGES } from '../constants/messages';
import { userProfileRepository, UserProfileRepository } from '../repositories/user-profile.repository';
import logger from '../utils/logger';
import { matchRepository, MatchRepository } from '../repositories/match.repository';

export class UserReviewController {
    constructor(private readonly userReviewService: UserReviewService, private readonly userProfileRepository: UserProfileRepository, private readonly matchRepository: MatchRepository) { }

    create = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const reviewerUserId = BigInt(req.user!.id);
        const dto = {
            reviewedUserId: BigInt(req.body.reviewedUserId),
            rating: req.body.rating,
            reviewText: req.body.reviewText,
        };
        const review = await this.userReviewService.create(reviewerUserId, dto);
        this.userReviewService.getAverageRatingOfUser(dto.reviewedUserId).
            then((avgRating: number | null) => {
                this.userProfileRepository.update(dto.reviewedUserId, {
                    averageRating: avgRating
                });
                const matchId = req.body.relatedMatchId;
                this.matchRepository.update(matchId, { ratingReviewId: review.id })
            }).catch((error: any) => {
                logger.error(`[UserReviewController] Error occured while getting average review of user ${dto.reviewedUserId} error ${error}`)
            })
        sendResponse(res, StatusCodes.CREATED, MESSAGES.USER_REVIEW.CREATED_SUCCESSFULLY, review);
    };
}

export const userReviewController = new UserReviewController(userReviewService, userProfileRepository, matchRepository);
