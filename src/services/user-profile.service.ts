import { userProfileRepository, UserProfileRepository, UserProfile, CreateUserProfileDto, UpdateUserProfileDto } from '../repositories/user-profile.repository';
import { ApiError } from '../utils/response';
import { StatusCodes } from 'http-status-codes';
import { MESSAGES } from '../constants/messages';

export class UserProfileService {
    constructor(private readonly userProfileRepository: UserProfileRepository) { }

    async getByUserId(userId: bigint): Promise<UserProfile> {
        const profile = await this.userProfileRepository.getByUserId(userId);
        if (!profile) throw new ApiError(MESSAGES.USER_PROFILE.NOT_FOUND, StatusCodes.NOT_FOUND);
        return profile;
    }

    async create(userId: bigint, dto: CreateUserProfileDto): Promise<UserProfile> {
        const existing = await this.userProfileRepository.getByUserId(userId);
        if (existing) throw new ApiError(MESSAGES.USER_PROFILE.ALREADY_EXISTS, StatusCodes.CONFLICT);
        return this.userProfileRepository.create(userId, dto);
    }

    async update(userId: bigint, dto: UpdateUserProfileDto): Promise<UserProfile> {
        const profile = await this.userProfileRepository.update(userId, dto);
        if (!profile) throw new ApiError(MESSAGES.USER_PROFILE.NOT_FOUND, StatusCodes.NOT_FOUND);
        return profile;
    }
}

export const userProfileService = new UserProfileService(userProfileRepository);
