import Redis from 'ioredis';
import redisClient from '../../config/redis';
import RedisKeys from '../../utils/redisKeys';

class RedisOtpService {
    private client: Redis;
    constructor() {
        this.client = redisClient.getClient();
    }
    async setOtp(countryCode: string, phoneNumber: string, otp: string, expiresInSeconds: number): Promise<void> {
        const key = RedisKeys.phoneNumberOtp(countryCode, phoneNumber);
        await this.client.set(key, otp, 'EX', expiresInSeconds);
    }

    async getOtp(countryCode: string, phoneNumber: string): Promise<string | null> {
        const key = RedisKeys.phoneNumberOtp(countryCode, phoneNumber);
        return await this.client.get(key);
    }

    async deleteOtp(countryCode: string, phoneNumber: string): Promise<void> {
        const key = RedisKeys.phoneNumberOtp(countryCode, phoneNumber);
        await this.client.del(key);
    }
}

export const redisOtpService = new RedisOtpService();
