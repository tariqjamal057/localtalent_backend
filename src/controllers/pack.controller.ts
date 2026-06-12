import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { packService, PackService } from '../services/pack.service';
import { sendResponse } from '../utils/response';
import { MESSAGES } from '../constants/messages';
import { PACK_TYPE } from '../enums/packs';

export class PackController {
    constructor(private readonly packService: PackService) { }

    getMatchCountPacks = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const onlyActive = req.query.onlyActive as unknown as boolean;
        const packs = await this.packService.getMatchCountPacks(onlyActive);
        sendResponse(res, StatusCodes.OK, MESSAGES.PACK.MATCH_COUNT_FETCHED_SUCCESSFULLY, packs);
    };

    getAdPacks = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const onlyActive = req.query.onlyActive as unknown as boolean;
        const packs = await this.packService.getAdPacks(onlyActive);
        sendResponse(res, StatusCodes.OK, MESSAGES.PACK.AD_FETCHED_SUCCESSFULLY, packs);
    };

    createOrderForPack = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!.id;
        const { packId, adId, userPlatform, promoCode, type } = req.body;
        if (type === PACK_TYPE.MATCH_COUNT) {
            const order = await this.packService.createMatchPointsPackPaymentOrder({ userId, packId, userPlatform, promoCode: promoCode });
            sendResponse(res, StatusCodes.OK, MESSAGES.PACK.ORDER_CREATED_SUCCESSFULLY, order);
        } else {
            const order = await this.packService.createAdPackPaymentOrder({ userId, adId, userPlatform, promoCode: promoCode, adPackId: packId });
            sendResponse(res, StatusCodes.OK, MESSAGES.PACK.ORDER_CREATED_SUCCESSFULLY, order);
        }
    }
}

export const packController = new PackController(packService);
