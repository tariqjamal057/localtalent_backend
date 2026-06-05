import Redis from 'ioredis';
import { redisClient } from '../../config/redis';
import RedisKeys, { ONGOING_CALL_KEYS } from '../../utils/redisKeys';
import config from '../../config';

export class RedisCallService {
    private get client(): Redis {
        return redisClient.getClient();
    }

    public async acceptProposal(matchId: bigint, userId: bigint): Promise<boolean> {
        const added = await this.client.sadd(RedisKeys.getProposalAcceptedSetKey(matchId), userId.toString());
        await this.client.expire(RedisKeys.getProposalAcceptedSetKey(matchId), config.call.PROPOSAL_ACCEPTED_SET_TTL_SECONDS);
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

    public async setOngoingCall(matchId: bigint, data: Partial<Record<ONGOING_CALL_KEYS, string | number | boolean>>): Promise<void> {
        const key = RedisKeys.ongoingCallKey(matchId);
        await this.client.hset(key, data);
    }
    public async setValueForOngoingCall(matchId: bigint, k: ONGOING_CALL_KEYS, value: number | string): Promise<void> {
        const key = RedisKeys.ongoingCallKey(matchId);
        await this.client.hset(key, k, value);
    }

    public async getOngoingCall(matchId: bigint): Promise<Record<string, string>> {
        const key = RedisKeys.ongoingCallKey(matchId);
        return this.client.hgetall(key);
    }

    public async deleteOngoingCall(matchId: bigint): Promise<void> {
        const key = RedisKeys.ongoingCallKey(matchId);
        await this.client.del(key);
    }
}

export const redisCallService = new RedisCallService();