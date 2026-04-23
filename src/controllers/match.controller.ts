import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { matchService, MatchService } from '../services/match.service';
import { sendResponse } from '../utils/response';
import { MESSAGES } from '../constants/messages';

export class MatchController {
    constructor(private readonly matchService: MatchService) { }

    getAcceptedMatches = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const matches = await this.matchService.getAcceptedMatches(userId);
        sendResponse(res, StatusCodes.OK, MESSAGES.MATCH.FETCHED_SUCCESSFULLY, matches);
    };
}

export const matchController = new MatchController(matchService);
