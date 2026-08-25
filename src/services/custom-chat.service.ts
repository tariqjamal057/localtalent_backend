import { chatRoomRepository } from '../repositories/chat-room.repository';
import { messageRepository } from '../repositories/message.repository';
import { MessageDto } from '../types/custom-chat.type';
import { MESSAGE_TYPE } from '../enums/chat';
import logger from '../utils/logger';

class CustomChatService {
    async createRoom(matchId: bigint, user1Id: bigint, user2Id: bigint) {
        logger.debug(`[CustomChatService] Creating/getting chat room for matchId=${matchId}, user1=${user1Id}, user2=${user2Id}`);
        const room = await chatRoomRepository.createOrGet(matchId, user1Id, user2Id);
        logger.info(`[CustomChatService] Chat room ready: roomId=${room.id} for matchId=${matchId}`);
        return room;
    }

    async getRoomByMatchId(matchId: bigint) {
        logger.debug(`[CustomChatService] Fetching chat room by matchId=${matchId}`);
        const room = await chatRoomRepository.getByMatchId(matchId);
        logger.debug(`[CustomChatService] Room ${room ? `found (id=${room.id})` : 'not found'} for matchId=${matchId}`);
        return room;
    }

    async getRoomById(roomId: bigint) {
        logger.debug(`[CustomChatService] Fetching chat room by roomId=${roomId}`);
        const room = await chatRoomRepository.getById(roomId);
        logger.debug(`[CustomChatService] Room ${room ? 'found' : 'not found'} for roomId=${roomId}`);
        return room;
    }

    async sendMessage(chatRoomId: bigint, senderId: bigint, content: string, messageType: MESSAGE_TYPE = MESSAGE_TYPE.TEXT): Promise<MessageDto> {
        logger.debug(`[CustomChatService] Sending message in roomId=${chatRoomId} from sender=${senderId}, type=${messageType}, content length=${content.length}`);
        const message = await messageRepository.create(chatRoomId, senderId, content, messageType);
        await chatRoomRepository.updateLastMessage(chatRoomId, content);
        logger.info(`[CustomChatService] Message sent: messageId=${message.id} in roomId=${chatRoomId}`);
        return message;
    }

    async deleteMessage(messageId: string, senderId: bigint): Promise<MessageDto | null> {
        logger.debug(`[CustomChatService] Deleting message id=${messageId} by sender=${senderId}`);
        const result = await messageRepository.deleteMessage(messageId, senderId);
        if (result) {
            logger.info(`[CustomChatService] Message deleted: id=${messageId}`);
        }
        return result;
    }

    async getMessages(chatRoomId: bigint, limit?: number, before?: string): Promise<MessageDto[]> {
        logger.debug(`[CustomChatService] Fetching messages for roomId=${chatRoomId}, limit=${limit || 50}, before=${before || 'none'}`);
        const messages = await messageRepository.getByRoom(chatRoomId, limit, before);
        logger.debug(`[CustomChatService] Fetched ${messages.length} messages for roomId=${chatRoomId}`);
        return messages;
    }

    async markAsRead(chatRoomId: bigint, userId: bigint): Promise<void> {
        logger.debug(`[CustomChatService] Marking messages as read in roomId=${chatRoomId} for user=${userId}`);
        await messageRepository.markAsRead(chatRoomId, userId);
        logger.debug(`[CustomChatService] Messages marked as read in roomId=${chatRoomId} for user=${userId}`);
    }

    async getUnreadCount(chatRoomId: bigint, userId: bigint): Promise<number> {
        const count = await messageRepository.getUnreadCount(chatRoomId, userId);
        logger.debug(`[CustomChatService] Unread count for roomId=${chatRoomId}, user=${userId}: ${count}`);
        return count;
    }
}

export const customChatService = new CustomChatService();
