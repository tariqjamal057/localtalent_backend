import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CallService, callService } from '../services/call.service';
import { MESSAGES } from '../constants/messages';
import { sendResponse } from '../utils/response';

export class CallController {
    constructor(private readonly callService: CallService) { }

    handleVideoRequest = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!.id;
        const matchId = req.params.matchId as unknown as bigint;
        await this.callService.handleVideoRequest(userId, matchId);
        sendResponse(res, StatusCodes.OK, MESSAGES.CALL.VIDEO_REQUEST_SENT);
    };

    handleCallEnd = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!.id;
        const matchId = req.params.matchId as unknown as bigint;
        await this.callService.handleCallEnd({ matchId, userId });
        sendResponse(res, StatusCodes.OK, MESSAGES.CALL.CALL_ENDED);
    };

    handleBlocking = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!.id;
        const matchId = req.params.matchId as unknown as bigint;
        await this.callService.handleBlocking(userId, matchId);
        sendResponse(res, StatusCodes.OK, MESSAGES.USER_BLOCK.BLOCKED_SUCCESSFULLY);
    };

    handleUnblocking = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!.id;
        const matchId = req.params.matchId as unknown as bigint;
        await this.callService.handleUnblocking(userId, matchId);
        sendResponse(res, StatusCodes.OK, MESSAGES.USER_BLOCK.UNBLOCKED_SUCCESSFULLY);
    };

    handleProposalAcceptance = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!.id;
        const matchId = req.params.matchId as unknown as bigint;
        await this.callService.handleProposalAcceptance(userId, matchId);
        sendResponse(res, StatusCodes.OK, MESSAGES.CALL.ACCEPTED_SUCCESSFULLY);
    };
}

export const callController = new CallController(callService);
