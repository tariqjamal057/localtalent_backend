import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket, ServerOptions } from 'socket.io';
import config from './index';
import logger from '../utils/logger';

export class SocketService {
    private static instance: SocketService;
    private io: SocketIOServer | null = null;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public getIO(): SocketIOServer {
        if (!this.io) {
            throw new Error('SocketService: not initialised — call init() first.');
        }
        return this.io;
    }

    public init(httpServer: HttpServer): SocketIOServer {
        if (this.io) return this.io;

        const options: Partial<ServerOptions> = {
            cors: {
                origin: config.corsOrigin,
                credentials: true,
            },
            pingTimeout: config.socket.pingTimeoutMs,
            pingInterval: config.socket.pingIntervalMs,
            maxHttpBufferSize: config.socket.maxHttpBufferSize,
            transports: config.socket.transports,
            allowUpgrades: true,
            perMessageDeflate: { threshold: 1024 },
            path: '/socket.io',
        };

        this.io = new SocketIOServer(httpServer, options);

        this.registerMiddleware();
        this.registerHandlers();

        logger.info(
            `Socket.io initialised`
        );

        return this.io;
    }

    public async disconnect(): Promise<void> {
        if (this.io) {
            await new Promise<void>((resolve) => this.io!.close(() => resolve()));
            this.io = null;
            logger.info('Socket.io server closed');
        }
    }

    private registerMiddleware(): void {
        this.io!.use((socket: Socket, next) => {
            const token = socket.handshake.auth?.token as string | undefined;

            // if (!token) {
            //     return next(new Error('Authentication token required'));
            // }

            socket.data.token = token;
            return next();
        });
    }

    private registerHandlers(): void {
        this.io!.on('connection', (socket: Socket) => {
            logger.debug(
                `Socket connected: id=${socket.id} ip=${socket.handshake.address} ` +
                `transport=${socket.conn.transport.name}`
            );

            socket.conn.on('upgrade', (transport) => {
                logger.debug(`Socket ${socket.id}: upgraded to ${transport.name}`);
            });

            socket.on('error', (err: Error) => {
                logger.error(`Socket ${socket.id} error:`, err);
            });

            socket.on('disconnect', (reason: string) => {
                logger.debug(`Socket disconnected: id=${socket.id} reason=${reason}`);
            });

            socket.on('disconnecting', (reason: string) => {
                logger.debug(
                    `Socket ${socket.id} disconnecting from ` +
                    `rooms=[${[...socket.rooms].join(', ')}] reason=${reason}`
                );
            });
        });

        this.io!.engine.on('connection', () => {
            logger.debug(`Socket.io: active connections=${this.io!.engine.clientsCount}`);
        });
    }
}

export default SocketService.getInstance();
