import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MESSAGES } from '../constants/messages';
import { customChatService } from '../services/custom-chat.service';
import { sendResponse } from '../utils/response';
import { chatRoomRepository } from '../repositories/chat-room.repository';
import logger from '../utils/logger';

class CustomChatController {
    getMessages = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const roomId = BigInt(req.params.roomId);
        const limit = parseInt(req.query.limit as string) || 50;
        const before = req.query.before as string | undefined;
        logger.debug(`[ChatController] GET /chat-rooms/${roomId}/messages limit=${limit} before=${before || 'none'}`);
        const data = await customChatService.getMessages(roomId, limit, before);
        sendResponse(res, StatusCodes.OK, MESSAGES.CHAT.ROOM_FETCHED_SUCCESSFULLY, data);
    };

    markAsRead = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const roomId = BigInt(req.params.roomId);
        logger.debug(`[ChatController] POST /chat-rooms/${roomId}/read by userId=${userId}`);
        await customChatService.markAsRead(roomId, userId);
        sendResponse(res, StatusCodes.OK, 'Messages marked as read');
    };

    getRoomByMatchId = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = BigInt(req.user!.id);
        const matchId = BigInt(req.params.matchId);
        logger.debug(`[ChatController] GET /chat-rooms/by-match/${matchId} by userId=${userId}`);
        const room = await chatRoomRepository.getByMatchId(matchId);
        if (!room) {
            logger.warn(`[ChatController] No chat room found for matchId=${matchId}`);
            sendResponse(res, StatusCodes.NOT_FOUND, 'Chat room not found');
            return;
        }
        const isMember = room.user1Id === userId || room.user2Id === userId;
        if (!isMember) {
            logger.warn(`[ChatController] userId=${userId} is not a member of roomId=${room.id} (matchId=${matchId})`);
            sendResponse(res, StatusCodes.FORBIDDEN, 'Not a member of this chat room');
            return;
        }
        logger.info(`[ChatController] Returning chatRoomId=${room.id} for matchId=${matchId}`);
        sendResponse(res, StatusCodes.OK, MESSAGES.CHAT.ROOM_FETCHED_SUCCESSFULLY, { chatRoomId: room.id.toString() });
    };
}

export const customChatController = new CustomChatController();
