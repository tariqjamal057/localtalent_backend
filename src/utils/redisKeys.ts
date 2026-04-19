const RedisKeys = {
    userOtp: (userId: string) => `user:otp:${userId}`,
};

export default RedisKeys;
