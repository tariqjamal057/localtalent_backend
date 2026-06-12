import { MESSAGES } from '../constants/messages';
import { ApiError } from '../utils/response';
import { StatusCodes } from 'http-status-codes';
import { packRepository, PackRepository, MatchCountPack, AdPack } from '../repositories/pack.repository';
import { promocodeRepository, PromocodeRepository } from '../repositories/promocode.repository';
import { calculateTax } from '../utils/payment';
import { paymentOrderRepository, PaymentOrderRepository } from '../repositories/payment-order.repository';
import { razorpayService, RazorpayService } from './razorpay.service';
import { PAYMENT_ORDER_STATUS, PAYMENT_PROVIDERS, PAYMENT_PURPOSE } from '../enums/payment';
import { PACK_TYPE } from '../enums/packs';
import logger from '../utils/logger';

export class PackService {
    constructor(
        private readonly packRepository: PackRepository,
        private readonly promoCodeRepository: PromocodeRepository,
        private readonly paymentOrderRepository: PaymentOrderRepository,
        private readonly razorpayService: RazorpayService
    ) { }

    async getMatchCountPacks(onlyActive = true): Promise<MatchCountPack[]> {
        return this.packRepository.getMatchCountPacks(onlyActive);
    }

    async getAdPacks(onlyActive = true): Promise<AdPack[]> {
        return this.packRepository.getAdPacks(onlyActive);
    }

    async createMatchPointsPackPaymentOrder({
        userId,
        packId,
        userPlatform,
        promoCode
    }: {
        userId: bigint;
        packId: string;
        userPlatform: string;
        promoCode?: string | null;
    }) {
        logger.info(`Creating payment order for match count pack. userId: ${userId}, packId: ${packId}, userPlatform: ${userPlatform}, promoCode: ${promoCode}`);
        let promoCodeDetails;
        if (promoCode) {
            promoCodeDetails = await this.promoCodeRepository.getByCode(promoCode);
            if (!promoCodeDetails || !promoCodeDetails.isActive || promoCodeDetails.promoType != PACK_TYPE.MATCH_COUNT) {
                throw new ApiError(MESSAGES.PROMOCODE.INVALID_CODE, StatusCodes.BAD_REQUEST);
            }
        }
        const packDetails = await this.packRepository.getMatchCountPackById(BigInt(packId));
        if (!packDetails) {
            throw new ApiError(MESSAGES.PACK.INVALID_PACK_ID, StatusCodes.BAD_REQUEST);
        }
        const matchCount = packDetails.matchCount * (promoCodeDetails?.multiplier ?? 1);
        const amount = packDetails.offerPrice ?? packDetails.price;
        const tax = calculateTax(amount);
        const totalAmount = amount + tax;
        const razorpayOrder = await this.razorpayService.createOrder(totalAmount);
        if (!razorpayOrder || !razorpayOrder.id) {
            throw new ApiError(MESSAGES.PACK.ORDER_CREATION_FAILED, StatusCodes.INTERNAL_SERVER_ERROR);
        }
        const order = await this.paymentOrderRepository.create({
            userId,
            amount,
            tax,
            status: PAYMENT_ORDER_STATUS.ORDER_CREATED,
            purpose: PAYMENT_PURPOSE.MATCH_COUNT_PACK,
            productId: BigInt(packId),
            purchasedMatchCount: matchCount,
            bonusMatchCount: promoCodeDetails ? matchCount - packDetails.matchCount : 0,
            promocodeId: promoCodeDetails ? promoCodeDetails.id : undefined,
            orderId: razorpayOrder.id
        });
        logger.info(`Payment order created for match count pack. userId: ${userId}, packId: ${packId}, orderId: ${order.id}`);
        return {
            provider: PAYMENT_PROVIDERS.RAZORPAY,
            paymentOrderId: order.id,
            razorPayOrder: order
        };
    }

    async createAdPackPaymentOrder({
        userId,
        adId,
        userPlatform,
        promoCode,
        adPackId
    }: {
        userId: bigint;
        adId: string;
        userPlatform: string;
        promoCode?: string | null;
        adPackId: string
    }) {
        logger.info(`Creating payment order for ad pack. userId: ${userId}, adId: ${adId}, userPlatform: ${userPlatform}, promoCode: ${promoCode} , adPackId ${adPackId}`);
        let promoCodeDetails;
        if (promoCode) {
            promoCodeDetails = await this.promoCodeRepository.getByCode(promoCode);
            if (!promoCodeDetails || !promoCodeDetails.isActive || promoCodeDetails.promoType != PACK_TYPE.AD) {
                throw new ApiError(MESSAGES.PROMOCODE.INVALID_CODE, StatusCodes.BAD_REQUEST);
            }
        }
        const packDetails = await this.packRepository.getAdPackById(BigInt(adPackId));
        if (!packDetails) {
            throw new ApiError(MESSAGES.PACK.INVALID_PACK_ID, StatusCodes.BAD_REQUEST);
        }
        const maxImpressions = packDetails.maxImpressions * (promoCodeDetails?.multiplier ?? 1);
        const maxDays = packDetails.maxDays * (promoCodeDetails?.multiplier ?? 1);
        const amount = packDetails.offerPrice ?? packDetails.price;
        const tax = calculateTax(amount);
        const totalAmount = amount + tax;
        const razorpayOrder = await this.razorpayService.createOrder(totalAmount);
        if (!razorpayOrder || !razorpayOrder.id) {
            throw new ApiError(MESSAGES.PACK.ORDER_CREATION_FAILED, StatusCodes.INTERNAL_SERVER_ERROR);
        }
        const order = await this.paymentOrderRepository.create({
            userId,
            amount,
            tax,
            status: PAYMENT_ORDER_STATUS.ORDER_CREATED,
            purpose: PAYMENT_PURPOSE.AD_PACK,
            productId: BigInt(adId),
            purchasedAdImpressions: maxImpressions,
            purchasedAdDays: maxDays,
            bonusAdImpressions: promoCodeDetails ? (maxImpressions - packDetails.maxImpressions) : 0,
            bonusAdDays: promoCodeDetails ? (maxDays - packDetails.maxDays) : 0,
            promocodeId: promoCodeDetails ? promoCodeDetails.id : undefined,
            orderId: razorpayOrder.id
        });
        logger.info(`Payment order created for ad pack. userId: ${userId}, adId: ${adId}, orderId: ${order.id}`);
        return {
            provider: PAYMENT_PROVIDERS.RAZORPAY,
            paymentOrderId: order.id,
            razorPayOrder: order
        };
    };
}

export const packService = new PackService(packRepository, promocodeRepository, paymentOrderRepository, razorpayService);
