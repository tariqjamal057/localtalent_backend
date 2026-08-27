const RedisKeys = {
    getPhoneNumberOtp: (countryCode: string, phoneNumber: string) => `user:${countryCode + phoneNumber}:otp`,
    getUserLockKey: (userId: bigint) => `user:${userId}:lock`,
    getUserSearchKey: (userId: bigint) => `user:${userId}:search`,
    getUserStatusKey: (userId: bigint) => `user:${userId}:status`,
    getUserSeenSetKey: (userId: bigint) => `user:${userId}:seen`,
    getUserPriorityQueueKey: (userId: bigint) => `user:${userId}:pq`,
    getGeoIndexKey: () => `users:geo`,
    getProposalAcceptedSetKey: (matchId: bigint) => `match:${matchId}:proposal:accepted`,
    ongoingCallKey: (matchId: bigint) => `match:${matchId}:ongoing_call`,
    getActiveSearchersKey: () => `searchers:active`,
    getSearcherTypeKey: (searchType: number) => `searchers:type:${searchType}`,
    getSearcherCategoryKey: (categoryId: number) => `searchers:cat:${categoryId}`,
    getSearcherParamsKey: (userId: bigint) => `searchers:params:${userId}`,
};

export enum ONGOING_CALL_KEYS {
    STREAM_CALL_ID = 'streamCallId',
    USER_1_ID = 'user1Id',
    USER_2_ID = 'user2Id',
    IS_USER_1_JOINED = 'isUser1Joined',
    IS_USER_2_JOINED = 'isUser2Joined',
    CALL_START_TIMESTAMP = 'callStartTimestamp',
    IS_USER_1_ACCEPTED_PROPOSAL = 'isUser1AcceptedProposal',
    IS_USER_2_ACCEPTED_PROPOSAL = 'isUser2AcceptedProposal',
}

export default RedisKeys;
