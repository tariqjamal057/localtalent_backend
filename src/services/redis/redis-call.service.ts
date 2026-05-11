import Redis from 'ioredis';
import { redisClient } from '../../config/redis';
import RedisKeys from '../../utils/redisKeys';

export class RedisCallService {
    private client: Redis;
    constructor() {
        this.client = redisClient.getClient();
    }

    public async acceptProposal(matchId: bigint, userId: bigint): Promise<boolean> {
        const added = await this.client.sadd(RedisKeys.getProposalAcceptedSetKey(matchId), userId.toString());
        return added === 1;
    }

    public async getAcceptedUsers(matchId: bigint): Promise<bigint[]> {
        const members = await this.client.smembers(RedisKeys.getProposalAcceptedSetKey(matchId));
        return members.map(BigInt);
    }

    public async hasAccepted(matchId: bigint, userId: bigint): Promise<boolean> {
        const result = await this.client.sismember(RedisKeys.getProposalAcceptedSetKey(matchId), userId.toString());
        return result === 1;
    }

    public async getAcceptedCount(matchId: bigint): Promise<number> {
        return this.client.scard(RedisKeys.getProposalAcceptedSetKey(matchId));
    }

    public async deleteProposalAcceptedSet(matchId: bigint): Promise<void> {
        await this.client.del(RedisKeys.getProposalAcceptedSetKey(matchId));
    }
}

export const redisCallService = new RedisCallService();