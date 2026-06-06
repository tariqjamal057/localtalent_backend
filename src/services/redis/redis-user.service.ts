import Redis from 'ioredis';
import { redisClient } from '../../config/redis';
import RedisKeys from '../../utils/redisKeys';
import { USER_STATUS } from '../../enums/user';
import { MatchRequest } from '../../types/socket-data.type';
import logger from '../../utils/logger';

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));


export class RedisUserService {
    private get client(): Redis {
        return redisClient.getClient();
    }

    //priority-queue operations for user matches

    public async pushMultipleItemsToPriorityQueue(userId: bigint, items: { element: string, priority: number }[]): Promise<void> {
        const key = RedisKeys.getUserPriorityQueueKey(userId);
        const flattenedItems = items.flatMap(item => [item.priority, item.element]);
        try {
            logger.info(`Pushing ${items.length} items to priority queue for user ${userId} and items: ${JSON.stringify(items)}.`);
            await this.client.zadd(key, ...flattenedItems);
            logger.info(`Successfully pushed ${items.length} items to priority queue for user ${userId}.`);
        } catch (error) {
            logger.info(`Failed to push multiple items to priority queue for user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async pushToPriorityQueueAndGetSize(userId: bigint, element: string, priority: number): Promise<number> {
        const key = RedisKeys.getUserPriorityQueueKey(userId);
        const results = await this.client.pipeline()
            .zadd(key, priority, element)
            .zcard(key)
            .exec();
        return results![1][1] as number;
    }

    //lower number higher priority
    public async popFromPriorityQueue(
        userId: bigint,
        count: number = 1
    ): Promise<bigint[]> {

        const result = await this.client.zpopmin(
            RedisKeys.getUserPriorityQueueKey(userId),
            count
        );

        // logger.info(
        //     `Popped ${result.length} items from priority queue for user ${userId}. Result: ${JSON.stringify(result)}`
        // );

        const elements: bigint[] = [];

        for (let i = 0; i < result.length; i += 2) {
            elements.push(BigInt(result[i]));
        }

        return elements;
    }

    public async sizeOfPriorityQueue(userId: bigint): Promise<number> {
        return this.client.zcard(RedisKeys.getUserPriorityQueueKey(userId),);
    }

    public async isPriorityQueueEmpty(userId: bigint): Promise<boolean> {
        return (await this.sizeOfPriorityQueue(userId)) === 0;
    }

    public async clearPriorityQueue(userId: bigint): Promise<void> {
        await this.client.del(RedisKeys.getUserPriorityQueueKey(userId),);
    }


    //seen set operations for user matches

    public async addToSeenSet(userId: bigint, seenUserId: bigint): Promise<void> {
        await this.client.sadd(RedisKeys.getUserSeenSetKey(userId), seenUserId.toString());
    }

    public async addManyToSeenSet(userId: bigint, seenUserIds: bigint[]): Promise<void> {
        if (seenUserIds.length === 0) return;
        await this.client.sadd(RedisKeys.getUserSeenSetKey(userId), ...seenUserIds.map(id => id.toString()));
    }

    public async removeFromSeenSet(userId: bigint, seenUserId: bigint): Promise<void> {
        await this.client.srem(RedisKeys.getUserSeenSetKey(userId), seenUserId.toString());
    }

    public async clearSeenSet(userId: bigint): Promise<void> {
        await this.client.del(RedisKeys.getUserSeenSetKey(userId));
    }

    public async checkIsAlreadySeen(
        userId: bigint,
        targetUserId: bigint
    ): Promise<boolean> {
        const result = await this.client.sismember(
            RedisKeys.getUserSeenSetKey(userId),
            targetUserId.toString()
        );

        return result === 1;
    }


    //user-search-data operations

    public async setUserSearchData(userId: bigint, data: Record<string, string | number>): Promise<void> {
        const key = RedisKeys.getUserSearchKey(userId);
        await this.client.hset(key, data);
    }

    public async getUserSearchData(
        userId: bigint
    ): Promise<MatchRequest | null> {
        const value = await this.client.hgetall(
            RedisKeys.getUserSearchKey(userId)
        );
        if (!value || Object.keys(value).length === 0) return null;
        const spokenLangIds = JSON.parse(value.spokenLanguageIds) as number[];
        return {
            name: value.name,
            age: Number(value.age),
            experience: Number(value.experience),
            spokenLanguageIds: spokenLangIds,

            latitude: Number(value.latitude),
            longitude: Number(value.longitude),
            searchRadiusKm: Number(value.searchRadiusKm),

            gender: Number(value.gender),
            rate: Number(value.rate),
            rateType: Number(value.rateType),

            availableTiming: Number(value.availableTiming),
            availabilityType: Number(value.availabilityType),

            categoryLevelOneId: Number(value.categoryLevelOneId),
            categoryLevelTwoId: Number(value.categoryLevelTwoId),
            categoryLevelThreeId: Number(value.categoryLevelThreeId),

            searchType: Number(value.searchType),
        };
    }

    public async getUserSearchDataFields(userId: bigint, fields: string[]): Promise<Record<string, string | null>> {
        const values = await this.client.hmget(RedisKeys.getUserSearchKey(userId), ...fields);
        return Object.fromEntries(fields.map((field, i) => [field, values[i]]));
    }

    public async clearUserSearchData(userId: bigint): Promise<void> {
        await this.client.del(RedisKeys.getUserSearchKey(userId));
    }


    //user-status operations

    public async setUserStatus(userId: bigint, status: USER_STATUS, ttlSeconds?: number): Promise<void> {
        const key = RedisKeys.getUserStatusKey(userId);
        if (ttlSeconds) {
            await this.client.set(key, status, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, status);
        }
    }

    public async getUserStatus(userId: bigint): Promise<USER_STATUS | null> {
        const value = await this.client.get(RedisKeys.getUserStatusKey(userId));
        return value as USER_STATUS | null;
    }

    public async deleteUserStatus(userId: bigint): Promise<void> {
        await this.client.del(RedisKeys.getUserStatusKey(userId));
    }

    //user-lock operations

    public async acquireLock(userId: bigint, ttlSeconds: number): Promise<boolean> {
        const result = await this.client.set(RedisKeys.getUserLockKey(userId), '1', 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }

    public async acquireLockWithRetry(userId: bigint, ttlSeconds: number, maxRetries: number = 3, baseDelayMs: number = 100): Promise<boolean> {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            const acquired = await this.acquireLock(userId, ttlSeconds);
            if (acquired) return true;
            if (attempt < maxRetries) {
                const backoff = baseDelayMs * Math.pow(2, attempt);
                await sleep(backoff);
            }
        }
        return false;
    }

    public async releaseLock(userId: bigint): Promise<void> {
        await this.client.del(RedisKeys.getUserLockKey(userId));
    }


    //user-geo operations

    public async setUserGeo(userId: bigint, latitude: number, longitude: number): Promise<void> {
        await this.client.geoadd(RedisKeys.getGeoIndexKey(), longitude, latitude, userId.toString());
    }

    public async clearUserGeo(userId: bigint): Promise<void> {
        await this.client.zrem(RedisKeys.getGeoIndexKey(), userId.toString());
    }

    public async getUsersWithinRadius(userId: bigint, radiusKm: number): Promise<string[]> {
        const result = await this.client.geosearch(
            RedisKeys.getGeoIndexKey(),
            'FROMMEMBER',
            userId.toString(),
            'BYRADIUS',
            radiusKm,
            'km',
            'ASC',
        ) as string[];
        return result;
    }

    public async clearAllUserData(userId: bigint): Promise<void> {
        await Promise.all([
            this.clearPriorityQueue(userId),
            this.clearSeenSet(userId),
            this.clearUserSearchData(userId),
            this.deleteUserStatus(userId),
            this.clearUserGeo(userId),
        ]);
    }
}

export const redisUserService = new RedisUserService();

