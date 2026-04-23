import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { userBlockService, UserBlockService } from '../services/user-block.service';
import { sendResponse } from '../utils/response';
import { MESSAGES } from '../constants/messages';

export class UserBlockController {
    constructor(private readonly userBlockService: UserBlockService) { }

    block = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const blockedUserId = BigInt(req.params.blockedUserId);
        const block = await this.userBlockService.block(userId, blockedUserId);
        sendResponse(res, StatusCodes.CREATED, MESSAGES.USER_BLOCK.BLOCKED_SUCCESSFULLY, block);
    };

    unblock = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const blockedUserId = BigInt(req.params.blockedUserId);
        await this.userBlockService.unblock(userId, blockedUserId);
        sendResponse(res, StatusCodes.OK, MESSAGES.USER_BLOCK.UNBLOCKED_SUCCESSFULLY, null);
    };

    getAllWithProfiles = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const blocks = await this.userBlockService.getAllWithProfiles(userId);
        sendResponse(res, StatusCodes.OK, MESSAGES.USER_BLOCK.FETCHED_SUCCESSFULLY, blocks);
    };
}

export const userBlockController = new UserBlockController(userBlockService);
