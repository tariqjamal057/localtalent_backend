import Razorpay from 'razorpay';
import crypto from 'crypto';
import config from '../config';
import { Orders } from 'razorpay/dist/types/orders';

export class RazorpayService {
    private readonly client: Razorpay;

    constructor() {
        this.client = new Razorpay({
            key_id: config.payment.RAZORPAY_KEY_ID,
            key_secret: config.payment.RAZORPAY_KEY_SECRET,
        });
    }

    async createOrder(amountInRupees: number): Promise<Orders.RazorpayOrder> {
        const order = await this.client.orders.create({
            amount: Math.round(amountInRupees * 100),
            currency: 'INR'
        });
        return order;
    }

    verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
        const expected = crypto
            .createHmac('sha256', config.payment.RAZORPAY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('hex');
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    }

    async fetchOrderPayments(orderId: string): Promise<{ captured: boolean; paymentId: string }[]> {
        const order = await this.client.orders.fetch(orderId);
        if (!order || !order.amount_paid || order.amount_paid === 0) {
            return [];
        }
        const payments = await this.client.orders.fetchPayments(orderId);
        return payments.items.map((p) => ({
            captured: p.status === 'captured',
            paymentId: p.id,
        }));
    }
}

export const razorpayService = new RazorpayService();
