import { Router } from 'express';
import { z } from 'zod';
import { matchController } from '../controllers/match.controller';
import authenticate from '../middleware/authenticate';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';

const router = Router();

const paginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

router.get(
    '/',
    authenticate,
    matchController.getAcceptedMatches
);

router.get(
    '/accepted',
    authenticate,
    validate(paginationQuerySchema, VALIDATION_SOURCE.QUERY),
    matchController.getAcceptedMatchesPaginated
);

export default router;
