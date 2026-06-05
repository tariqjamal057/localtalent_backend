import { Router } from 'express';
import { z } from 'zod';
import authenticate from '../middleware/authenticate';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';
import { callController } from '../controllers/call.controller';

const router = Router();

const matchIdParamsSchema = z.object({
    matchId: z.coerce.bigint().positive(),
});

router.post(
    '/:matchId/video-request',
    authenticate,
    validate(matchIdParamsSchema, VALIDATION_SOURCE.PARAMS),
    callController.handleVideoRequest
);

router.post(
    '/:matchId/end',
    authenticate,
    validate(matchIdParamsSchema, VALIDATION_SOURCE.PARAMS),
    callController.handleCallEnd
);

export default router;
