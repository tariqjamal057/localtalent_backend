import redisClient from '../config/redis';
import RedisKeys from '../utils/redisKeys';

class RedisOtpService {
    async setUserOtp(userId: string, otp: string, ttlSeconds: number = 300): Promise<void> {
        const client = redisClient.getClient();
        await client.set(RedisKeys.userOtp(userId), otp, 'EX', ttlSeconds);
    }

    async getUserOtp(userId: string): Promise<string | null> {
        const client = redisClient.getClient();
        return client.get(RedisKeys.userOtp(userId));
    }

    async deleteUserOtp(userId: string): Promise<void> {
        const client = redisClient.getClient();
        await client.del(RedisKeys.userOtp(userId));
    }
}

export default new RedisOtpService();
