import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { deviceTokenRepository, DeviceTokenRepository } from '../repositories/device-token.repository';
import { sendResponse } from '../utils/response';
import logger from '../utils/logger';

export class DeviceTokenController {
    constructor(private readonly deviceTokenRepository: DeviceTokenRepository) { }

    register = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const token = req.body.token as string;
        const platform = (req.body.platform as string) || 'android';
        try {
            await this.deviceTokenRepository.upsert(userId, token, platform);
            sendResponse(res, StatusCodes.OK, 'Device token registered successfully', null);
        } catch (error) {
            logger.error(`Failed to register device token for user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
            sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to register device token', null);
        }
    };

    unregister = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const token = req.body.token as string;
        try {
            await this.deviceTokenRepository.deleteByToken(userId, token);
            sendResponse(res, StatusCodes.OK, 'Device token removed successfully', null);
        } catch (error) {
            logger.error(`Failed to remove device token for user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
            sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to remove device token', null);
        }
    };
}

export const deviceTokenController = new DeviceTokenController(deviceTokenRepository);