import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MESSAGES } from '../constants/messages';
import { chatService } from '../services/chat.service';
import { sendResponse } from '../utils/response';

class ChatController {
    createOrGetChatRoom = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!.id;
        const otherUserId = BigInt(req.params.otherUserId);
        const data = await chatService.createOrGetChatRoom(userId, otherUserId);
        sendResponse(res, StatusCodes.OK, MESSAGES.CHAT.ROOM_FETCHED_SUCCESSFULLY, data);
    };
}

export const chatController = new ChatController();
