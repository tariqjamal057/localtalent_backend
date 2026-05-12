import { MESSAGES } from "../constants/messages";
import { MATCH_STATE } from "../enums/match";
import { matchRepository, MatchRepository } from "../repositories/match.repository";
import { userProfileRepository, UserProfileRepository } from "../repositories/user-profile.repository";
import { UserDataToJoinChat } from "../types/chat.type";
import { StreamUtil } from "../utils/stream";

class ChatService {
    constructor(
        private readonly matchRepository: MatchRepository,
        private readonly userProfileRepository: UserProfileRepository,
    ) { }
    async createOrGetChatRoom(userId: bigint, otherUserId: bigint) {
        const existingMatches = await this.matchRepository.getByTwoUsers(userId, otherUserId, MATCH_STATE.MATCHED);
        if (!existingMatches || existingMatches.length === 0) {
            throw new Error(MESSAGES.MATCH.NOT_FOUND);
        }
        const [user, otheruser] = await Promise.all([
            this.userProfileRepository.getByUserId(userId),
            this.userProfileRepository.getByUserId(otherUserId)
        ]);
        const usersDataToJoinChat: UserDataToJoinChat[] = await StreamUtil.setupChatForUsers([
            { id: userId, name: user?.fullName! },
            { id: otherUserId, name: otheruser?.fullName! }
        ]);
        return usersDataToJoinChat.find(u => u.userId === userId)!;
    }
}

export const chatService = new ChatService(matchRepository, userProfileRepository);