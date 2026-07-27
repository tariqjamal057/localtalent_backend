import { Router } from 'express';
import { z } from 'zod';
import authenticate from '../middleware/authenticate';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';
import { customChatController } from '../controllers/custom-chat.controller';

const router = Router();

const roomIdParamsSchema = z.object({
    roomId: z.coerce.bigint().positive(),
});

const matchIdParamsSchema = z.object({
    matchId: z.coerce.bigint().positive(),
});

router.get(
    '/by-match/:matchId',
    authenticate,
    validate(matchIdParamsSchema, VALIDATION_SOURCE.PARAMS),
    customChatController.getRoomByMatchId
);

router.get(
    '/:roomId/messages',
    authenticate,
    validate(roomIdParamsSchema, VALIDATION_SOURCE.PARAMS),
    customChatController.getMessages
);

router.post(
    '/:roomId/read',
    authenticate,
    validate(roomIdParamsSchema, VALIDATION_SOURCE.PARAMS),
    customChatController.markAsRead
);

export default router;
