import logger from './utils/logger';
import queueService from './services/queue/queue.service';
import CallQueue from './services/queue/call.queue';
import { JOB_NAME } from './enums/jobs';

async function bootstrap(): Promise<void> {
    queueService.init(async (job) => {
        switch (job.data.jobName) {
            case JOB_NAME.END_CALL:
                await CallQueue.handleCallEndJob(job.data as any);
                break;
            default:
                logger.warn(`Worker: no handler for job "${job.id}" with name "${job.data.jobName}"`);
        }
    });

    logger.info('Worker process started');
}

async function gracefulShutdown(signal: string): Promise<void> {
    logger.info(`${signal} received: shutting down worker`);
    try {
        await queueService.close();
    } catch (err) {
        logger.error('Error during worker shutdown:', err);
    }
    logger.info('Worker shutdown complete');
    process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err: Error) => {
    logger.error('Worker uncaughtException:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Worker unhandledRejection:', reason);
    process.exit(1);
});

bootstrap().catch((err) => {
    logger.error('Worker failed to start:', err);
    process.exit(1);
});
