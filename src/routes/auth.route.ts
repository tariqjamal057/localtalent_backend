import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';

const router = Router();

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

const generateOtpSchema = z.object({
    phoneNumber: z.string().min(4, 'Phone number is required').max(15, 'Phone number is too long'),
    countryCode: z.string().min(2, 'Country code is required'),
});

const verifyOtpSchema = z.object({
    phoneNumber: z.string().min(4, 'Phone number is required').max(15, 'Phone number is too long'),
    countryCode: z.string().min(2, 'Country code is required'),
    otp: z.string().min(4, 'OTP is required').max(10, 'OTP is too long'),
    appLanguageCode: z.string().length(2, 'App language code must be 2 characters'),
    fullName: z.string().optional()
});

router.post(
    '/refresh-token',
    validate(refreshTokenSchema, VALIDATION_SOURCE.BODY),
    authController.refreshToken
);

router.post(
    '/generate-otp',
    validate(generateOtpSchema, VALIDATION_SOURCE.BODY),
    authController.generateOtp
);

router.post(
    '/verify-otp',
    validate(verifyOtpSchema, VALIDATION_SOURCE.BODY),
    authController.verifyOtp
);

export default router;
