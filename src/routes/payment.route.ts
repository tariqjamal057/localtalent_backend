import { Router } from 'express';
import { z } from 'zod';
import { paymentController } from '../controllers/payment.controller';
import authenticate from '../middleware/authenticate';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';

const router = Router();

const paginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

router.get(
    '/orders',
    authenticate,
    validate(paginationQuerySchema, VALIDATION_SOURCE.QUERY),
    paymentController.getOrdersByUserId
);

router.post('/webhook/razorpay', paymentController.handleRazorpayWebhook);

export default router;
