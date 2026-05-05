export const MESSAGES = {
    AUTH: {
        TOKEN_REFRESHED: 'Access token refreshed successfully',
        INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
        REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
        ACCESS_TOKEN_REQUIRED: 'Access token is required',
        OTP_SENT: 'OTP sent successfully',
        OTP_ALREADY_SENT: 'An OTP has already been sent to this phone number. Please try again later.',
        INVALID_OTP: 'Invalid OTP',
        OTP_VERIFIED: 'OTP verified successfully',
    },
    CATEGORY: {
        FETCHED_SUCCESSFULLY: 'Categories fetched successfully',
    },
    PACK: {
        MATCH_COUNT_FETCHED_SUCCESSFULLY: 'Match count packs fetched successfully',
        AD_FETCHED_SUCCESSFULLY: 'Ad packs fetched successfully',
        ORDER_CREATED_SUCCESSFULLY: 'Order for pack created successfully',
        INVALID_PACK_ID: 'Invalid pack ID',
        ORDER_CREATION_FAILED: 'Failed to create order for the pack, please try again later',
    },
    USER_PROFILE: {
        FETCHED_SUCCESSFULLY: 'User profile fetched successfully',
        CREATED_SUCCESSFULLY: 'User profile created successfully',
        UPDATED_SUCCESSFULLY: 'User profile updated successfully',
        NOT_FOUND: 'User profile not found',
        ALREADY_EXISTS: 'User profile already exists',
    },
    PROMOCODE: {
        INVALID_CODE: 'Invalid promo code',
        EXPIRED_CODE: 'Promo code has expired',
        USAGE_LIMIT_REACHED: 'Promo code usage limit has been reached',
    },
    USER_BLOCK: {
        BLOCKED_SUCCESSFULLY: 'User blocked successfully',
        UNBLOCKED_SUCCESSFULLY: 'User unblocked successfully',
        FETCHED_SUCCESSFULLY: 'Blocked users fetched successfully',
        ALREADY_BLOCKED: 'User is already blocked',
        NOT_FOUND: 'Block record not found',
        CANNOT_BLOCK_SELF: 'You cannot block yourself',
    },
    USER_REVIEW: {
        CREATED_SUCCESSFULLY: 'Review submitted successfully',
    },
    USER_WALLET: {
        FETCHED_SUCCESSFULLY: 'Wallet fetched successfully',
    },
    MATCH: {
        FETCHED_SUCCESSFULLY: 'Matches fetched successfully',
        NOT_FOUND: 'No matches found',
        INVALID_STATE_TO_INITIATE_CALL: 'Cannot initiate call in the current match state',
        NOT_A_MEMBER_OF_MATCH: 'User is not a member of this match',
        INVALID_STATE_TO_START_CALL: 'Cannot start call in the current match state',
    },
    AD: {
        FETCHED_SUCCESSFULLY: 'Ads fetched successfully',
        CREATED_SUCCESSFULLY: 'Ad created successfully',
        NOT_FOUND: 'Ad not found',
        IMPRESSION_INCREMENTED: 'Ad impression count incremented successfully',
    },
    STREAM: {
        CHAT_CHANNEL_CREATION_FAILED: 'Failed to create chat channel, please try again later',
        CALL_CREATION_FAILED: 'Failed to create call, please try again later',
    },
    SEARCH: {
        INSUFFICIENT_BALANCE: 'You do not have enough matches available. Please purchase more matches to continue searching.',
    },
    CALL: {
        USER_LOCKED: 'One of the users is currently busy. Please try again later.',
        USER_BUSY: 'One of the users is currently busy. Please try again later.',
        REQUESTED_SUCCESSFULLY: 'Call requested successfully',
        ACCEPTED_SUCCESSFULLY: 'Call accepted successfully',
    }
};
