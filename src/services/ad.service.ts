import { adRepository, AdRepository, UserAd, CreateAdDto, PaginatedAds } from '../repositories/ad.repository';
import { packService, PackService } from './pack.service';

export class AdService {
    constructor(
        private readonly adRepository: AdRepository,
        private readonly packservice: PackService
    ) { }

    async getAdsForDisplay(page: number, limit: number): Promise<PaginatedAds> {
        return this.adRepository.getAdsForDisplay(page, limit);
    }

    async getAdsByUserId(userId: bigint, page: number, limit: number): Promise<PaginatedAds> {
        return this.adRepository.getAdsByUserId(userId, page, limit);
    }

    async incrementImpressionCount(id: bigint): Promise<void> {
        return this.adRepository.incrementImpressionCount(id);
    }

    async createAd(userId: bigint, dto: CreateAdDto): Promise<{
        ad: UserAd;
        order?: any;
    }> {
        const ad = await this.adRepository.create(userId, {
            mediaType: dto.mediaType,
            mediaUrl: dto.mediaUrl,
            title: dto.title ?? null,
            description: dto.description ?? null,
        });
        if (dto?.shouldAutoExecuteOrder && dto?.adPackId && dto?.userPlatform) {
            const order = await this.packservice.createAdPackPaymentOrder({
                userId,
                adId: ad.id.toString(),
                userPlatform: dto.userPlatform,
                promoCode: dto.promoCode,
            });
            return {
                ad,
                order
            }
        } else {
            return {
                ad
            }
        }
    }
}

export const adService = new AdService(adRepository, packService);
