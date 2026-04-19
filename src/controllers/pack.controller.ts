import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { packService, PackService } from '../services/pack.service';
import { sendResponse } from '../utils/response';
import { MESSAGES } from '../constants/messages';

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
}

export const packController = new PackController(packService);
