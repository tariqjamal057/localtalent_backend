import { Router } from 'express';
import { z } from 'zod';
import { userBlockController } from '../controllers/user-block.controller';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';
import authenticate from '../middleware/authenticate';

const router = Router();

const blockedUserIdParamSchema = z.object({
    blockedUserId: z.string().regex(/^\d+$/, 'blockedUserId must be a positive integer'),
});

router.post(
    '/:blockedUserId',
    authenticate,
    validate(blockedUserIdParamSchema, VALIDATION_SOURCE.PARAMS),
    userBlockController.block
);

router.delete(
    '/:blockedUserId',
    authenticate,
    validate(blockedUserIdParamSchema, VALIDATION_SOURCE.PARAMS),
    userBlockController.unblock
);

router.get(
    '/',
    authenticate,
    userBlockController.getAllWithProfiles
);

export default router;
