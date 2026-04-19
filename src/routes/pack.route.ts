import { Router } from 'express';
import { z } from 'zod';
import { packController } from '../controllers/pack.controller';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';
import authenticate from '../middleware/authenticate';

const router = Router();

const onlyActiveQuerySchema = z.object({
    onlyActive: z
        .enum(["true", "false"])
        .default("true")
        .transform(v => v === "true"),
});

router.get(
    '/match-count',
    authenticate,
    validate(onlyActiveQuerySchema, VALIDATION_SOURCE.QUERY),
    packController.getMatchCountPacks
);

router.get(
    '/ad',
    authenticate,
    validate(onlyActiveQuerySchema, VALIDATION_SOURCE.QUERY),
    packController.getAdPacks
);

export default router;
