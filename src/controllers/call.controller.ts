import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CallService, callService } from '../services/call.service';
import { MESSAGES } from '../constants/messages';
import { sendResponse } from '../utils/response';

export class CallController {
    constructor(private readonly callService: CallService) { }

    requestCall = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!.id;
        const matchId = req.params.matchId as unknown as bigint;
        await this.callService.requestCall(userId, matchId);
        sendResponse(res, StatusCodes.OK, MESSAGES.CALL.REQUESTED_SUCCESSFULLY);
    };

    handleCallAccepted = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!.id;
        const matchId = req.params.matchId as unknown as bigint;
        await this.callService.handleCallAccepted(userId, matchId);
        sendResponse(res, StatusCodes.OK, MESSAGES.CALL.ACCEPTED_SUCCESSFULLY);
    };
}

export const callController = new CallController(callService);
