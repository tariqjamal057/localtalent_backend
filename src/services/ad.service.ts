import { PAYMENT_PROVIDERS } from '../enums/payment';
import { adRepository, AdRepository, CreateAdDto, PaginatedAds } from '../repositories/ad.repository';
import { PaymentOrder } from '../types/payment.types';
import { packService, PackService } from './pack.service';

export class AdService {
    constructor(
        private readonly adRepository: AdRepository,
        private readonly packservice: PackService
    ) { }

    async getAdsForDisplay(userId: bigint, page: number, limit: number): Promise<PaginatedAds> {
        return this.adRepository.getAdsForDisplay(userId, page, limit);
    }

    async getAdsByUserId(userId: bigint, page: number, limit: number): Promise<PaginatedAds> {
        return this.adRepository.getAdsByUserId(userId, page, limit);
    }

    async incrementImpressionCount(id: bigint): Promise<void> {
        return this.adRepository.incrementImpressionCount(id);
    }

    async createAd(userId: bigint, dto: CreateAdDto): Promise<{
        provider: PAYMENT_PROVIDERS;
        paymentOrderId: bigint;
        razorPayOrder: PaymentOrder;
    } | void> {
        const adId = dto?.adId ?? (await this.adRepository.create(userId, {
            mediaType: dto.mediaType,
            mediaUrl: dto.mediaUrl,
            title: dto.title ?? null,
            description: dto.description ?? null,
        })).id;
        if (dto?.shouldAutoExecuteOrder && dto?.adPackId && dto?.userPlatform) {
            const order = await this.packservice.createAdPackPaymentOrder({
                userId,
                adId: adId.toString(),
                userPlatform: dto.userPlatform,
                promoCode: dto.promoCode,
            });
            return order;
        } else {
            return;
        }
    }
}

export const adService = new AdService(adRepository, packService);
