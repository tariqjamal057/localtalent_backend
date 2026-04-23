import { Router } from 'express';
import { z } from 'zod';
import { packController } from '../controllers/pack.controller';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';
import authenticate from '../middleware/authenticate';
import { PACK_TYPE, USER_PLATFORM } from '../enums/packs';

const router = Router();

const onlyActiveQuerySchema = z.object({
    onlyActive: z
        .enum(["true", "false"])
        .default("true")
        .transform(v => v === "true"),
});

const createOrderSchema = z.object({
    packId: z.string(),
    userPlatform: z.enum(USER_PLATFORM),
    promocode: z.string().optional().nullable(),
    type: z.enum(PACK_TYPE),
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

router.post(
    '/create-order',
    authenticate,
    validate(createOrderSchema, VALIDATION_SOURCE.BODY),
    packController.createOrderForPack
)

export default router;
