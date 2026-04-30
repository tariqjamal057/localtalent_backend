import Redis, { RedisOptions } from 'ioredis';
import config from './index';
import logger from '../utils/logger';

export class RedisService {
    private static instance: RedisService;
    private client: Redis | null = null;

    private constructor() { }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    public getClient(): Redis {
        if (!this.client) {
            throw new Error('RedisService: not connected — call connect() first.');
        }
        return this.client;
    }

    public async connect(): Promise<void> {
        if (this.client) return;

        this.client = new Redis(this.buildOptions());

        this.client.on('connect', () => logger.info('Redis: connected'));
        this.client.on('ready', () => logger.info('Redis: ready'));
        this.client.on('error', (err: Error) => logger.error('Redis error:', err));
        this.client.on('close', () => logger.warn('Redis: connection closed'));
        this.client.on('reconnecting', () => logger.warn('Redis: reconnecting…'));
        this.client.on('end', () => logger.warn('Redis: connection ended'));

        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(
                () => reject(new Error('RedisService: connection timed out')),
                config.redis.connectTimeoutMs * 3
            );
            this.client!.once('ready', () => { clearTimeout(timeout); resolve(); });
            this.client!.once('error', (err) => { clearTimeout(timeout); reject(err); });
        });

        await this.client.ping();
        logger.info('Redis: connection verified with PING');
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.client = null;
            logger.info('Redis disconnected');
        }
    }

    private buildOptions(): RedisOptions {
        const url = new URL(config.redis.url);
        const isTLS = url.protocol === 'rediss:';

        return {
            host: url.hostname,
            port: parseInt(url.port || '6379', 10),
            username: url.username || undefined,
            password: url.password ? decodeURIComponent(url.password) : undefined,
            tls: isTLS ? { rejectUnauthorized: true } : undefined,
            keyPrefix: config.redis.keyPrefix,
            connectTimeout: config.redis.connectTimeoutMs,
            commandTimeout: config.redis.commandTimeoutMs,
            maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
            enableOfflineQueue: true,
            retryStrategy: (times: number) => {
                if (times > 10) {
                    logger.error(`Redis: max retries (${times}) exceeded — giving up`);
                    return null;
                }
                const delay = Math.min(times * 200, 3000);
                logger.warn(`Redis: retry #${times} — reconnecting in ${delay}ms`);
                return delay;
            },
            reconnectOnError: (err: Error) => err.message.includes('READONLY'),
        };
    }
}

export const redisClient = RedisService.getInstance();
