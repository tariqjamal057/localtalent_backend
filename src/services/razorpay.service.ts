import Razorpay from 'razorpay';
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
}

export const razorpayService = new RazorpayService();
