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
    '/:matchId/request',
    authenticate,
    validate(matchIdParamsSchema, VALIDATION_SOURCE.PARAMS),
    callController.requestCall
);

router.post(
    '/:matchId/accept',
    authenticate,
    validate(matchIdParamsSchema, VALIDATION_SOURCE.PARAMS),
    callController.handleCallAccepted
);

export default router;
