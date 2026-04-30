const RedisKeys = {
    getPhoneNumberOtp: (countryCode: string, phoneNumber: string) => `user:${countryCode + phoneNumber}:otp`,
    getUserLockKey: (userId: bigint) => `user:${userId}:lock`,
    getUserSearchKey: (userId: bigint) => `user:${userId}:search`,
    getUserStatusKey: (userId: bigint) => `user:${userId}:status`,
    getUserSeenSetKey: (userId: bigint) => `user:${userId}:seen`,
    getUserPriorityQueueKey: (userId: bigint) => `user:${userId}:pq`,
    getGeoIndexKey: () => `users:geo`,
};

export default RedisKeys;
