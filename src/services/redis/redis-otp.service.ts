import Redis from 'ioredis';
import RedisKeys from '../../utils/redisKeys';
import { redisClient } from '../../config/redis';

class RedisOtpService {
    private get client(): Redis {
        return redisClient.getClient();
    }
    async setOtp(countryCode: string, phoneNumber: string, otp: string, expiresInSeconds: number): Promise<void> {
        const key = RedisKeys.getPhoneNumberOtp(countryCode, phoneNumber);
        await this.client.set(key, otp, 'EX', expiresInSeconds);
    }

    async getOtp(countryCode: string, phoneNumber: string): Promise<string | null> {
        const key = RedisKeys.getPhoneNumberOtp(countryCode, phoneNumber);
        return await this.client.get(key);
    }

    async deleteOtp(countryCode: string, phoneNumber: string): Promise<void> {
        const key = RedisKeys.getPhoneNumberOtp(countryCode, phoneNumber);
        await this.client.del(key);
    }
}

export const redisOtpService = new RedisOtpService();
