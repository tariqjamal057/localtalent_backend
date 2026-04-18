import http from 'http';
import app from './app';
import config from './config';
import logger from './utils/logger';
import db from './config/database';
import redis from './config/redis';
import socketService from './config/socket';

const server = http.createServer(app);

async function bootstrap(): Promise<void> {
    await db.connect();
    await redis.connect();

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
            await Promise.all([db.disconnect(), redis.disconnect(), socketService.disconnect()]);
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
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
});

bootstrap().catch((err) => {
    logger.error('Bootstrap failed:', err);
    process.exit(1);
});
