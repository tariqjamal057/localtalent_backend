import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { userReviewService, UserReviewService } from '../services/user-review.service';
import { sendResponse } from '../utils/response';
import { MESSAGES } from '../constants/messages';

export class UserReviewController {
    constructor(private readonly userReviewService: UserReviewService) { }

    create = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const reviewerUserId = BigInt(req.user!.id);
        const dto = {
            reviewedUserId: BigInt(req.body.reviewedUserId),
            rating: req.body.rating,
            reviewText: req.body.reviewText,
            relatedMatchId: BigInt(req.body.relatedMatchId),
        };
        const review = await this.userReviewService.create(reviewerUserId, dto);
        sendResponse(res, StatusCodes.CREATED, MESSAGES.USER_REVIEW.CREATED_SUCCESSFULLY, review);
    };
}

export const userReviewController = new UserReviewController(userReviewService);
