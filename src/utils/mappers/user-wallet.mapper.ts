import { UserWallet, UserWalletRow } from '../../types/user-wallet.types';

export function userWalletRowToDto(row: UserWalletRow): UserWallet {
    return {
        id: row.id,
        userId: row.user_id,
        availableMatchCount: row.available_match_count,
        freeMatchCountAvailable: row.free_match_count_available,
        videoRequestCountAvailable: row.video_request_count_available,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
