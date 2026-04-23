import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { userWalletService, UserWalletService } from '../services/user-wallet.service';
import { sendResponse } from '../utils/response';
import { MESSAGES } from '../constants/messages';

export class UserWalletController {
    constructor(private readonly userWalletService: UserWalletService) { }

    getAvailableMatchCount = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const availableMatchCount = await this.userWalletService.getAvailableMatchCount(userId);
        sendResponse(res, StatusCodes.OK, MESSAGES.USER_WALLET.FETCHED_SUCCESSFULLY, { availableMatchCount });
    };
}

export const userWalletController = new UserWalletController(userWalletService);
