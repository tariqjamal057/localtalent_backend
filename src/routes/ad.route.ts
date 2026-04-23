import { Router } from 'express';
import { z } from 'zod';
import { adController } from '../controllers/ad.controller';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';
import authenticate from '../middleware/authenticate';
import { USER_PLATFORM } from '../enums/packs';

const router = Router();

const paginationQuerySchema = z.object({
    page: z
        .string()
        .default('1')
        .transform(v => parseInt(v, 10))
        .pipe(z.number().int().min(1)),
    limit: z
        .string()
        .default('10')
        .transform(v => parseInt(v, 10))
        .pipe(z.number().int().min(1).max(100)),
});

const createAdSchema = z.object({
    mediaType: z.number().int().positive(),
    mediaUrl: z.string(),
    title: z.string().max(150).optional().nullable(),
    description: z.string().optional().nullable(),
    adPackId: z.string().optional(),
    shouldAutoExecuteOrder: z.boolean().default(false),
    promoCode: z.string().optional(),
    userPlatform: z.enum(USER_PLATFORM)
});

router.get(
    '/display',
    authenticate,
    validate(paginationQuerySchema, VALIDATION_SOURCE.QUERY),
    adController.getAdsForDisplay
);

router.get(
    '/my',
    authenticate,
    validate(paginationQuerySchema, VALIDATION_SOURCE.QUERY),
    adController.getAdsByUserId
);

router.post(
    '/',
    authenticate,
    validate(createAdSchema, VALIDATION_SOURCE.BODY),
    adController.createAd
);

router.patch(
    '/:id/impression',
    authenticate,
    adController.incrementImpressionCount
);

export default router;
