import { Router } from 'express';
import { z } from 'zod';
import { uploadController } from '../controllers/upload.controller';
import authenticate from '../middleware/authenticate';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';

const router = Router();

const ALLOWED_CONTENT_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
];

const ALLOWED_FOLDERS = ['profile', 'ad'] as const;

const presignedUrlSchema = z.object({
    fileName: z.string().min(1).max(200),
    contentType: z.enum(ALLOWED_CONTENT_TYPES as [string, ...string[]]),
    folder: z.enum(ALLOWED_FOLDERS),
});

router.get(
    '/presigned-url',
    authenticate,
    validate(presignedUrlSchema, VALIDATION_SOURCE.QUERY),
    uploadController.getPresignedUrl,
);

export default router;
