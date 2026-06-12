import { Router } from 'express';
import { z } from 'zod';
import { userProfileController } from '../controllers/user-profile.controller';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';
import authenticate from '../middleware/authenticate';

const router = Router();

const createUserProfileSchema = z.object({
    fullName: z.string().max(120).optional().nullable(),
    gender: z.number().int().optional().nullable(),
    age: z.number().int().min(0).optional().nullable(),
    experienceLevel: z.number().int().optional().nullable(),
    pricePerDay: z.number().min(0).optional().nullable(),
    locationName: z.string().max(150).optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    spokenLanguages: z.array(z.string()).optional().nullable(),
});

const updateUserProfileSchema = createUserProfileSchema;

router.get(
    '/',
    authenticate,
    userProfileController.getByUserId
);

router.post(
    '/',
    authenticate,
    validate(createUserProfileSchema, VALIDATION_SOURCE.BODY),
    userProfileController.create
);

router.patch(
    '/',
    authenticate,
    validate(updateUserProfileSchema, VALIDATION_SOURCE.BODY),
    userProfileController.update
);

export default router;
