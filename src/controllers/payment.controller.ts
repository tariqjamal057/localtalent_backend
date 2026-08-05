import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { razorpayService } from '../services/razorpay.service';
import { paymentOrderRepository } from '../repositories/payment-order.repository';
import { userWalletRepository } from '../repositories/user-wallet.repository';
import { PAYMENT_ORDER_STATUS, PAYMENT_PURPOSE } from '../enums/payment';
import { adRepository } from '../repositories/ad.repository';
import { sendResponse, sendError } from '../utils/response';
import { MESSAGES } from '../constants/messages';
import logger from '../utils/logger';

export class PaymentController {

    getOrdersByUserId = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const page = Number(req.query.page);
        const limit = Number(req.query.limit);
        const purpose = req.query.purpose ? Number(req.query.purpose) : undefined;
        const result = await paymentOrderRepository.getByUserIdPaginated(userId, page, limit, purpose);
        sendResponse(res, StatusCodes.OK, MESSAGES.PAYMENT.FETCHED_SUCCESSFULLY, result);
    };

    handleRazorpayWebhook = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        logger.info('[PaymentWebhook] Webhook received from Razorpay');

        const signature = req.headers['x-razorpay-signature'] as string;
        if (!signature) {
            logger.warn('[PaymentWebhook] Missing x-razorpay-signature header');
            sendError(res, MESSAGES.PAYMENT.INVALID_SIGNATURE, StatusCodes.BAD_REQUEST);
            return;
        }
        logger.info('[PaymentWebhook] Signature header present, verifying...');

        const rawBody = (req as any).rawBody as Buffer;
        const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
            logger.warn('[PaymentWebhook] Signature verification failed');
            sendError(res, MESSAGES.PAYMENT.INVALID_SIGNATURE, StatusCodes.UNAUTHORIZED);
            return;
        }
        logger.info('[PaymentWebhook] Signature verified successfully');

        const payload = req.body;
        const event: string = payload.event;
        logger.info(`[PaymentWebhook] Event type: ${event}`);

        if (event !== 'payment.captured') {
            logger.info(`[PaymentWebhook] Ignoring event: ${event}`);
            res.status(StatusCodes.OK).json({ received: true });
            return;
        }

        const razorpayOrderId: string = payload?.payload?.payment?.entity?.order_id;
        logger.info(`[PaymentWebhook] Extracted razorpay order_id: ${razorpayOrderId}`);
        if (!razorpayOrderId) {
            logger.warn('[PaymentWebhook] order_id missing from payload');
            sendError(res, MESSAGES.PAYMENT.ORDER_NOT_FOUND, StatusCodes.BAD_REQUEST);
            return;
        }

        logger.info(`[PaymentWebhook] Looking up order in DB for order_id: ${razorpayOrderId}`);
        const order = await paymentOrderRepository.getByOrderId(razorpayOrderId);
        if (!order) {
            logger.warn(`[PaymentWebhook] Order not found in DB for order_id: ${razorpayOrderId}`);
            sendError(res, MESSAGES.PAYMENT.ORDER_NOT_FOUND, StatusCodes.NOT_FOUND);
            return;
        }
        logger.info(`[PaymentWebhook] Order found: id=${order.id} userId=${order.userId} purpose=${order.purpose} status=${order.status}`);

        if (order.status === PAYMENT_ORDER_STATUS.PAYMENT_SUCCESSFUL) {
            logger.info(`[PaymentWebhook] Order ${order.id} already processed, skipping`);
            res.status(StatusCodes.OK).json({ received: true });
            return;
        }

        logger.info(`[PaymentWebhook] Updating order ${order.id} status to PAYMENT_SUCCESSFUL`);
        await paymentOrderRepository.updateStatus(order.id, { status: PAYMENT_ORDER_STATUS.PAYMENT_SUCCESSFUL });

        if (order.purpose === PAYMENT_PURPOSE.MATCH_COUNT_PACK) {
            const matchCredit = (order.purchasedMatchCount ?? 0) + (order.bonusMatchCount ?? 0);
            const videoCredit = order.purchasedMatchCount ?? 0;
            logger.info(`[PaymentWebhook] Crediting wallet for userId=${order.userId}: matchCount+=${matchCredit}, videoRequestCount+=${videoCredit}`);
            await userWalletRepository.incrementMatchPackCredits(order.userId, matchCredit, videoCredit);
            logger.info(`[PaymentWebhook] Wallet credited successfully for userId=${order.userId}`);
        } else if (order.purpose === PAYMENT_PURPOSE.AD_PACK) {
            const maxAdDays = (order.purchasedAdDays ?? 0) + (order.bonusAdDays ?? 0);
            const maxAdImpressions = (order.purchasedAdImpressions ?? 0) + (order.bonusAdImpressions ?? 0);
            if (order.productId) {
                const expiresOn = new Date();
                expiresOn.setDate(expiresOn.getDate() + maxAdDays);
                logger.info(`[PaymentWebhook] Activating ad id=${order.productId} for userId=${order.userId}: maxDays=${maxAdDays}, maxImpressions=${maxAdImpressions}, expiresOn=${expiresOn.toISOString()}`);
                await adRepository.activateAd(order.productId, maxAdDays, maxAdImpressions, expiresOn);
                logger.info(`[PaymentWebhook] Ad ${order.productId} activated successfully`);
            } else {
                logger.warn(`[PaymentWebhook] AD_PACK order ${order.id} has no productId — cannot activate ad`);
            }
        } else {
            logger.info(`[PaymentWebhook] Purpose ${order.purpose} — no wallet action taken`);
        }

        logger.info(`[PaymentWebhook] Webhook processing complete for order_id: ${razorpayOrderId}`);
        sendResponse(res, StatusCodes.OK, MESSAGES.PAYMENT.WEBHOOK_PROCESSED);
    };
}

export const paymentController = new PaymentController();
