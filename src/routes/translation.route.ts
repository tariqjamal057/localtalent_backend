import { Router } from 'express';
import { z } from 'zod';
import { translationController } from '../controllers/translation.controller';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';

const router = Router();

const localeParamsSchema = z.object({
    locale: z.string().min(2).max(5),
    namespace: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid namespace format'),
});

router.get('/supported-locales', translationController.getSupportedLocales);

router.get(
    '/:locale/:namespace',
    validate(localeParamsSchema, VALIDATION_SOURCE.PARAMS),
    translationController.getTranslations
);

export default router;
