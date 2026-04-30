import { Queue, Worker, Job, ConnectionOptions } from 'bullmq';
import config from '../../config';
import logger from '../../utils/logger';
import { JOB_NAME } from '../../enums/jobs';
import CallQueue from './call.queue';

const QUEUE_NAME = 'main';



export interface JobPayload<T = unknown> {
    jobName: JOB_NAME;
    data: T;
}

export type JobHandler = (job: Job<JobPayload>) => Promise<void>;

export class QueueService {
    private static instance: QueueService;
    private readonly connection: ConnectionOptions;
    private queue: Queue;
    private worker: Worker | null = null;

    private constructor() {
        const url = new URL(config.queueRedis.url);
        const isTLS = url.protocol === 'rediss:';

        this.connection = {
            host: url.hostname,
            port: parseInt(url.port || '6379', 10),
            username: url.username || undefined,
            password: url.password ? decodeURIComponent(url.password) : undefined,
            tls: isTLS ? { rejectUnauthorized: true } : undefined,
            maxRetriesPerRequest: null,
            enableOfflineQueue: true,
        };

        this.queue = new Queue(QUEUE_NAME, { connection: this.connection });
    }

    public static getInstance(): QueueService {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }

    public init(handler: JobHandler): void {
        if (this.worker) {
            logger.warn('QueueService: worker already initialised — skipping');
            return;
        }

        this.worker = new Worker(
            QUEUE_NAME,
            async (job: Job<JobPayload>) => handler(job),
            { connection: this.connection, concurrency: 5 },
        );

        this.worker.on('completed', (job: Job<JobPayload>) => {
            logger.info(`QueueService: job "${job.id}" (${job.data.jobName}) completed`);
            switch (job.data.jobName) {
                case JOB_NAME.END_CALL:
                    CallQueue.handleCallEndJob(job.data as JobPayload<{ callId: string }>);
                    break;
                default:
                    logger.warn(`QueueService: no handler for completed job "${job.id}" with name "${job.data.jobName}"`);
            }
        });

        this.worker.on('failed', (job: Job<JobPayload> | undefined, err: Error) => {
            logger.error(`QueueService: job "${job?.id ?? 'unknown'}" (${job?.data?.jobName}) failed`, { error: err.message });
        });

        this.worker.on('error', (err: Error) => {
            logger.error('QueueService: worker error', { error: err.message });
        });

        logger.info('QueueService: worker initialised');
    }

    public async addDelayedJob<T = unknown>(key: string, jobName: JOB_NAME, data: T, delayMs: number): Promise<void> {
        try {
            const payload: JobPayload<T> = { jobName, data };
            await this.queue.add(QUEUE_NAME, payload, { delay: delayMs, jobId: key });
            logger.info(`QueueService: job "${key}" (${jobName}) scheduled in ${delayMs}ms`);
        } catch (err) {
            logger.error(`QueueService: failed to schedule job "${key}" (${jobName})`, { error: (err as Error).message });
            throw err;
        }
    }

    public async removeJob(key: string): Promise<void> {
        try {
            const job = await Job.fromId(this.queue, key);
            if (!job) {
                logger.warn(`QueueService: job "${key}" not found — nothing to remove`);
                return;
            }
            await job.remove();
            logger.info(`QueueService: job "${key}" removed`);
        } catch (err) {
            logger.error(`QueueService: failed to remove job "${key}"`, { error: (err as Error).message });
            throw err;
        }
    }

    public async close(): Promise<void> {
        try {
            if (this.worker) await this.worker.close();
            await this.queue.close();
            logger.info('QueueService: closed');
        } catch (err) {
            logger.error('QueueService: error during close', err);
        }
    }
}

export default QueueService.getInstance();
