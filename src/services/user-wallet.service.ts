import { userWalletRepository, UserWalletRepository } from '../repositories/user-wallet.repository';

export class UserWalletService {
    constructor(private readonly userWalletRepository: UserWalletRepository) { }

    async getAvailableMatchCount(userId: bigint): Promise<number> {
        const wallet = await this.userWalletRepository.getByUserId(userId);
        return wallet ? wallet.availableMatchCount : 0;
    }
}

export const userWalletService = new UserWalletService(userWalletRepository);
