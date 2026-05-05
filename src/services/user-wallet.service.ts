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
}

export const userWalletService = new UserWalletService(userWalletRepository);
