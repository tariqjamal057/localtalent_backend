import { UserWallet, UserWalletRow } from '../../types/user-wallet.types';

export function userWalletRowToDto(row: UserWalletRow): UserWallet {
    return {
        id: row.id,
        userId: row.user_id,
        availableMatchCount: row.available_match_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
