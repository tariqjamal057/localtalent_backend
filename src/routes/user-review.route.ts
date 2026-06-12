import { Router } from 'express';
import { z } from 'zod';
import { userReviewController } from '../controllers/user-review.controller';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';
import authenticate from '../middleware/authenticate';

const router = Router();

const createUserReviewSchema = z.object({
    reviewedUserId: z.number().int().positive(),
    rating: z.number().int().min(1).max(5),
    reviewText: z.string().optional().nullable(),
    matchId: z.number().int(),
});

const dismissReviewSchema = z.object({
    matchId: z.number().int().positive(),
});

router.get(
    '/pending-review',
    authenticate,
    userReviewController.getPendingReviewMatch
);

router.patch(
    '/skip',
    authenticate,
    validate(dismissReviewSchema, VALIDATION_SOURCE.BODY),
    userReviewController.dismissReview
);

router.post(
    '/',
    authenticate,
    validate(createUserReviewSchema, VALIDATION_SOURCE.BODY),
    userReviewController.create
);

export default router;
