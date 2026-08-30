import { Router } from 'express';
import { z } from 'zod';
import { deviceTokenController } from '../controllers/device-token.controller';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';
import authenticate from '../middleware/authenticate';

const router = Router();

const registerTokenSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    platform: z.enum(['android', 'ios']).optional(),
});

const unregisterTokenSchema = z.object({
    token: z.string().min(1, 'Token is required'),
});

router.post(
    '/',
    authenticate,
    validate(registerTokenSchema, VALIDATION_SOURCE.BODY),
    deviceTokenController.register
);

router.delete(
    '/',
    authenticate,
    validate(unregisterTokenSchema, VALIDATION_SOURCE.BODY),
    deviceTokenController.unregister
);

export default router;