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

    dismissReview = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const matchId = BigInt(req.body.matchId);
        const dismissed = await this.matchRepository.dismissReview(matchId, userId);
        if (!dismissed) {
            sendResponse(res, StatusCodes.BAD_REQUEST, MESSAGES.USER_REVIEW.DISMISS_FAILED, null);
            return;
        }
        sendResponse(res, StatusCodes.OK, MESSAGES.USER_REVIEW.REVIEW_DISMISSED, null);
    };

    getPendingReviewMatch = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const match = await this.matchRepository.getPendingReviewMatch(userId);
        if (!match) {
            sendResponse(res, StatusCodes.OK, MESSAGES.USER_REVIEW.NO_PENDING_MATCH, null);
            return;
        }
        sendResponse(res, StatusCodes.OK, MESSAGES.USER_REVIEW.PENDING_MATCH_FETCHED, match);
    };

    getReviewsByUserId = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.params.userId);
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 20;
        const reviews = await this.userReviewService.getReviewsByUserId(userId, page, limit);
        sendResponse(res, StatusCodes.OK, 'Reviews fetched successfully', reviews);
    };

    create = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const reviewerUserId = BigInt(req.user!.id);
        const dto = {
            reviewedUserId: BigInt(req.body.reviewedUserId),
            rating: req.body.rating,
            reviewText: req.body.reviewText,
        };
        const review = await this.userReviewService.create(reviewerUserId, dto);
        const matchId = req.body.matchId ? BigInt(req.body.matchId) : null;
        this.userReviewService.getAverageRatingOfUser(dto.reviewedUserId).
            then(async (avgRating: number | null) => {
                this.userProfileRepository.update(dto.reviewedUserId, {
                    averageRating: avgRating
                });
                if (matchId) {
                    const match = await this.matchRepository.getById(matchId);
                    if (match) {
                        const isRecruiter = match.recruiterUserId == reviewerUserId;
                        await this.matchRepository.update(matchId, isRecruiter
                            ? { recruiterReviewId: review.id }
                            : { candidateReviewId: review.id }
                        );
                    }
                }
            }).catch((error: any) => {
                logger.error(`[UserReviewController] Error occured while getting average review of user ${dto.reviewedUserId} error ${error}`)
            })
        sendResponse(res, StatusCodes.CREATED, MESSAGES.USER_REVIEW.CREATED_SUCCESSFULLY, review);
    };
}

export const userReviewController = new UserReviewController(userReviewService, userProfileRepository, matchRepository);
