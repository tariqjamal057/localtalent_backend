import { userBlockRepository, UserBlockRepository, UserBlock, UserBlockWithProfile } from '../repositories/user-block.repository';
import { ApiError } from '../utils/response';
import { StatusCodes } from 'http-status-codes';
import { MESSAGES } from '../constants/messages';

export class UserBlockService {
    constructor(private readonly userBlockRepository: UserBlockRepository) { }

    async block(userId: bigint, blockedUserId: bigint): Promise<UserBlock> {
        if (userId === blockedUserId) {
            throw new ApiError(MESSAGES.USER_BLOCK.CANNOT_BLOCK_SELF, StatusCodes.BAD_REQUEST);
        }
        const alreadyBlocked = await this.userBlockRepository.exists(userId, blockedUserId);
        if (alreadyBlocked) {
            throw new ApiError(MESSAGES.USER_BLOCK.ALREADY_BLOCKED, StatusCodes.CONFLICT);
        }
        return this.userBlockRepository.block(userId, blockedUserId);
    }

    async unblock(userId: bigint, blockedUserId: bigint): Promise<void> {
        const deleted = await this.userBlockRepository.unblock(userId, blockedUserId);
        if (!deleted) {
            throw new ApiError(MESSAGES.USER_BLOCK.NOT_FOUND, StatusCodes.NOT_FOUND);
        }
    }

    async getAll(userId: bigint): Promise<UserBlock[]> {
        return this.userBlockRepository.getAllByUserId(userId);
    }

    async getAllWithProfiles(userId: bigint): Promise<UserBlockWithProfile[]> {
        return this.userBlockRepository.getAllWithProfilesByUserId(userId);
    }
}

export const userBlockService = new UserBlockService(userBlockRepository);
