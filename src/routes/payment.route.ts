import { Router } from 'express';
import express from 'express';
import { paymentController } from '../controllers/payment.controller';

const router = Router();

router.post(
    '/webhook/razorpay',
    express.raw({ type: 'application/json' }),
    paymentController.handleRazorpayWebhook
);

export default router;
