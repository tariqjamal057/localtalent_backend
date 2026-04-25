import { Queue, Worker, Job, ConnectionOptions, WorkerOptions, JobsOptions } from 'bullmq';
import config from '../../config';
import logger from '../../utils/logger';

export type JobHandler<T = unknown, R = unknown> = (job: Job<T>) => Promise<R>;

interface RegisteredQueue<T = unknown, R = unknown> {
    queue: Queue<T, R>;
    worker: Worker<T, R>;
}

/**
 * QueueService — singleton that manages BullMQ queues and workers.
 *
 * Usage:
 *   const qs = QueueService.getInstance();
 *   qs.register('email', async (job) => { ... });
 *   await qs.add('email', { to: 'user@example.com' });
 *   await qs.add('email', { to: 'user@example.com' }, { delay: 5000 }); // delayed 5 s
 */
export class QueueService {
    private static instance: QueueService;
    private readonly connection: ConnectionOptions;
    private readonly queues = new Map<string, RegisteredQueue<unknown, unknown>>();

    private constructor() {
        const url = new URL(config.redis.url);
        const isTLS = url.protocol === 'rediss:';

        // BullMQ requires maxRetriesPerRequest: null on its ioredis connections
        this.connection = {
            host: url.hostname,
            port: parseInt(url.port || '6379', 10),
            username: url.username || undefined,
            password: url.password ? decodeURIComponent(url.password) : undefined,
            tls: isTLS ? { rejectUnauthorized: true } : undefined,
            maxRetriesPerRequest: null,
            enableOfflineQueue: true,
        };
    }

    public static getInstance(): QueueService {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }

    /**
     * Register a queue and attach a worker that processes its jobs.
     * Must be called once per queue name before `add()`.
     */
    public register<T = unknown, R = unknown>(
        name: string,
        handler: JobHandler<T, R>,
        workerOptions?: Partial<WorkerOptions>,
    ): void {
        if (this.queues.has(name)) {
            logger.warn(`QueueService: queue "${name}" already registered — skipping`);
            return;
        }

        const queue = new Queue<T, R>(name, { connection: this.connection });

        const worker = new Worker<T, R>(
            name,
            async (job: Job<T>) => handler(job),
            {
                connection: this.connection,
                concurrency: 5,
                ...workerOptions,
            },
        );

        worker.on('completed', (job: Job<T>, result: R) => {
            logger.info(`Queue "${name}" job ${job.id} completed`, { result });
        });

        worker.on('failed', (job: Job<T> | undefined, err: Error) => {
            logger.error(`Queue "${name}" job ${job?.id ?? 'unknown'} failed`, { error: err.message });
        });

        worker.on('error', (err: Error) => {
            logger.error(`Queue "${name}" worker error`, { error: err.message });
        });

        this.queues.set(name, { queue, worker } as RegisteredQueue<unknown, unknown>);
        logger.info(`QueueService: queue "${name}" registered`);
    }

    /**
     * Add a job to the named queue.
     * Pass `jobOptions.delay` (ms) to schedule a future job.
     */
    public async add<T = unknown>(
        name: string,
        data: T,
        jobOptions?: JobsOptions,
    ): Promise<string | undefined> {
        const entry = this.queues.get(name);
        if (!entry) {
            throw new Error(`QueueService: queue "${name}" is not registered`);
        }

        const job = await (entry.queue as Queue).add(name, data as never, jobOptions);
        logger.info(`QueueService: job ${job.id} added to queue "${name}"`, { delay: jobOptions?.delay });
        return job.id;
    }

    /**
     * Schedule a job to run after `delayMs` milliseconds.
     */
    public async schedule<T = unknown>(
        name: string,
        data: T,
        delayMs: number,
        jobOptions?: Omit<JobsOptions, 'delay'>,
    ): Promise<string | undefined> {
        return this.add(name, data, { ...jobOptions, delay: delayMs });
    }

    /**
     * Gracefully close all workers and queue connections.
     * Call this during application shutdown.
     */
    public async close(): Promise<void> {
        const closures = [...this.queues.entries()].map(async ([name, { queue, worker }]) => {
            try {
                await worker.close();
                await queue.close();
                logger.info(`QueueService: queue "${name}" closed`);
            } catch (err) {
                logger.error(`QueueService: error closing queue "${name}"`, err);
            }
        });

        await Promise.all(closures);
        this.queues.clear();
    }
}

export default QueueService.getInstance();
