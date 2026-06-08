import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';

const router = Router();

router.post('/webhook/razorpay', paymentController.handleRazorpayWebhook);

export default router;
