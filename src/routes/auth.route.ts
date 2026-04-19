import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';

const router = Router();

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

router.post(
    '/refresh-token',
    validate(refreshTokenSchema, VALIDATION_SOURCE.BODY),
    authController.refreshToken
);

export default router;
