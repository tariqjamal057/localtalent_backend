import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { userProfileService, UserProfileService } from '../services/user-profile.service';
import { sendResponse } from '../utils/response';
import { MESSAGES } from '../constants/messages';

export class UserProfileController {
    constructor(private readonly userProfileService: UserProfileService) { }

    getByUserId = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const profile = await this.userProfileService.getByUserId(userId);
        sendResponse(res, StatusCodes.OK, MESSAGES.USER_PROFILE.FETCHED_SUCCESSFULLY, profile);
    };

    create = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const profile = await this.userProfileService.create(userId, req.body);
        sendResponse(res, StatusCodes.CREATED, MESSAGES.USER_PROFILE.CREATED_SUCCESSFULLY, profile);
    };

    update = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const profile = await this.userProfileService.update(userId, req.body);
        sendResponse(res, StatusCodes.OK, MESSAGES.USER_PROFILE.UPDATED_SUCCESSFULLY, profile);
    };
}

export const userProfileController = new UserProfileController(userProfileService);
