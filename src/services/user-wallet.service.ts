import { MESSAGES } from '../constants/messages';
import { userWalletRepository, UserWalletRepository } from '../repositories/user-wallet.repository';

export class UserWalletService {
    constructor(private readonly userWalletRepository: UserWalletRepository) { }

    async getAvailableMatchCount(userId: bigint): Promise<number> {
        const wallet = await this.userWalletRepository.getByUserId(userId);
        return wallet ? (wallet.availableMatchCount + wallet.freeMatchCountAvailable) : 0;
    }

    async isBalanceAvailiableToSearch(userId: bigint): Promise<boolean> {
        const wallet = await this.userWalletRepository.getByUserId(userId);
        if (!wallet) return false;
        return (wallet.availableMatchCount + wallet.freeMatchCountAvailable) > 0;
    }

    async isBalanceForVideoCallAvailable(userId: bigint): Promise<boolean> {
        const wallet = await this.userWalletRepository.getByUserId(userId);
        if (!wallet) return false;
        return wallet.videoRequestCountAvailable > 0;
    }

    async deductMatchCount(userId: bigint): Promise<void> {
        const wallet = await this.userWalletRepository.getByUserId(userId);
        if (!wallet) throw new Error(MESSAGES.USER_WALLET.NOT_FOUND);
        if (wallet.freeMatchCountAvailable > 0) {
            await this.userWalletRepository.updateByUserId(userId, {
                freeMatchCountAvailable: wallet.freeMatchCountAvailable - 1
            });
        } else if (wallet.availableMatchCount > 0) {
            await this.userWalletRepository.updateByUserId(userId, {
                availableMatchCount: wallet.availableMatchCount - 1
            });
        } else {
            throw new Error(MESSAGES.USER_WALLET.NO_MATCH_COUNT_AVAILABLE);
        }
    }

    async deductVideoRequestCount(userId: bigint): Promise<void> {
        const wallet = await this.userWalletRepository.getByUserId(userId);
        if (!wallet) throw new Error(MESSAGES.USER_WALLET.NOT_FOUND);
        if (wallet.videoRequestCountAvailable > 0) {
            await this.userWalletRepository.updateByUserId(userId, {
                videoRequestCountAvailable: wallet.videoRequestCountAvailable - 1
            });
        } else {
            throw new Error(MESSAGES.USER_WALLET.NO_VIDEO_REQUEST_COUNT_AVAILABLE);
        }
    }
}

export const userWalletService = new UserWalletService(userWalletRepository);
