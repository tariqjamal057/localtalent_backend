import http from 'http';
import app from './app';
import config from './config';
import logger from './utils/logger';
import db from './config/database';
import socketService from './config/socket';
import queueService from './services/queue/queue.service';
import { redisClient } from './config/redis';

const server = http.createServer(app);

async function bootstrap(): Promise<void> {
    await db.connect();
    await redisClient.connect();

    socketService.init(server);

    server.listen(config.port, () => {
        logger.info(`Server running on port ${config.port}`);
    });
}

async function gracefulShutdown(signal: string): Promise<void> {
    logger.info(`${signal} received: starting graceful shutdown`);

    server.close(async () => {
        logger.info('HTTP server closed');
        try {
            await Promise.all([db.disconnect(), redisClient.disconnect(), socketService.disconnect(), queueService.close()]);
        } catch (err) {
            logger.error('Error during shutdown cleanup:', err);
        }
        logger.info('Graceful shutdown complete');
        process.exit(0);
    });

    setTimeout(() => {
        logger.error('Graceful shutdown timed out — forcing exit');
        process.exit(1);
    }, 15_000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error: Error) => {
    logger.info('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
    logger.info('Unhandled Rejection:', reason);
    process.exit(1);
});



bootstrap().catch((err) => {
    logger.error('Bootstrap failed:', err);
    process.exit(1);
});
