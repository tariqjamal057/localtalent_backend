import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { adService, AdService } from '../services/ad.service';
import { sendResponse } from '../utils/response';
import { MESSAGES } from '../constants/messages';

export class AdController {
    constructor(private readonly adService: AdService) { }

    getAdsForDisplay = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!.id;
        const { page, limit } = req.query;
        const ads = await this.adService.getAdsForDisplay(userId, page as unknown as number, limit as unknown as number);
        sendResponse(res, StatusCodes.OK, MESSAGES.AD.FETCHED_SUCCESSFULLY, ads);
    };

    getAdsByUserId = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!.id;
        const { page, limit } = req.query;
        const ads = await this.adService.getAdsByUserId(userId, page as unknown as number, limit as unknown as number);
        sendResponse(res, StatusCodes.OK, MESSAGES.AD.FETCHED_SUCCESSFULLY, ads);
    };

    createAd = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!.id;
        const response = await this.adService.createAd(userId, req.body);
        sendResponse(res, StatusCodes.CREATED, MESSAGES.AD.CREATED_SUCCESSFULLY, response);
    };

    incrementImpressionCount = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const adIds = req.body?.adIds || [];
        this.adService.incrementImpressionCount(adIds);
        sendResponse(res, StatusCodes.OK, MESSAGES.AD.IMPRESSION_INCREMENTED);
    };
}

export const adController = new AdController(adService);
