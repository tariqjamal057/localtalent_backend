import { Router } from 'express';
import { z } from 'zod';
import authenticate from '../middleware/authenticate';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';
import { chatController } from '../controllers/chat.controller';

const router = Router();

const otherUserIdParamsSchema = z.object({
    otherUserId: z.coerce.bigint().positive(),
});

router.get(
    '/:otherUserId/token',
    authenticate,
    validate(otherUserIdParamsSchema, VALIDATION_SOURCE.PARAMS),
    chatController.getChatEntryDetails
);

router.post(
    '/:otherUserId/room',
    authenticate,
    validate(otherUserIdParamsSchema, VALIDATION_SOURCE.PARAMS),
    chatController.createOrGetChatRoom
);

export default router;
