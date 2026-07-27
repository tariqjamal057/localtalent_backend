import { chatRoomRepository } from '../repositories/chat-room.repository';
import { messageRepository } from '../repositories/message.repository';
import { MessageDto } from '../types/custom-chat.type';

class CustomChatService {
    async createRoom(matchId: bigint, user1Id: bigint, user2Id: bigint) {
        return chatRoomRepository.createOrGet(matchId, user1Id, user2Id);
    }

    async getRoomByMatchId(matchId: bigint) {
        return chatRoomRepository.getByMatchId(matchId);
    }

    async getRoomById(roomId: bigint) {
        return chatRoomRepository.getById(roomId);
    }

    async sendMessage(chatRoomId: bigint, senderId: bigint, content: string): Promise<MessageDto> {
        const message = await messageRepository.create(chatRoomId, senderId, content);
        await chatRoomRepository.updateLastMessage(chatRoomId, content);
        return message;
    }

    async getMessages(chatRoomId: bigint, limit?: number, before?: string): Promise<MessageDto[]> {
        return messageRepository.getByRoom(chatRoomId, limit, before);
    }

    async markAsRead(chatRoomId: bigint, userId: bigint): Promise<void> {
        return messageRepository.markAsRead(chatRoomId, userId);
    }

    async getUnreadCount(chatRoomId: bigint, userId: bigint): Promise<number> {
        return messageRepository.getUnreadCount(chatRoomId, userId);
    }
}

export const customChatService = new CustomChatService();
