import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket, ServerOptions } from 'socket.io';
import config from './index';
import logger from '../utils/logger';
import { verifyAccessToken } from '../utils/jwt';
import { socketGateway } from '../gateway/socket.gateway';
import { getUserRoomId } from '../utils/socket';
import { SOCKET_INCOMING_EVENT, SOCKET_OUTGOING_EVENT } from '../enums/socket';
import { MatchRequest } from '../types/socket-data.type';
import { matchService } from '../services/match.service';

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

    public emitToUser(userId: bigint, event: SOCKET_OUTGOING_EVENT, data: { [key: string]: any }): void {
        if (!this.io) {
            logger.warn(`emitToUser called before Socket.IO initialised`);
            return;
        }
        const roomId = getUserRoomId(userId);
        this.io.to(roomId)?.emit(event, data);
        logger.debug(`Emitted event=${event} to userId=${userId}`);
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
            const token = (socket.handshake.auth?.token || socket.handshake.query?.token || socket.handshake.headers?.token) as string | undefined;
            if (!token) {
                return next(new Error('Authentication token required'));
            }
            try {
                const decoded = verifyAccessToken(token);
                const user = { id: BigInt(decoded.userId) };
                socket.data.user = user;
            } catch (error) {
                logger.info(`Socket authentication failed: ${error instanceof Error ? error.message : String(error)}`);
                return next(new Error('Invalid authentication token'));
            }
            return next();
        });
    }

    private registerHandlers(): void {
        this.io!.on(SOCKET_INCOMING_EVENT.CONNECTION, (socket: Socket) => {
            logger.debug(
                `Socket connected: id=${socket.id} ip=${socket.handshake.address} ` +
                `transport=${socket.conn.transport.name}`
            );

            const user = socket.data.user;
            logger.info(`User connected via socket: userId=${user.id} socketId=${socket.id}`);
            const roomId = getUserRoomId(user.id);
            socket.join(roomId);
            logger.info(`Socket ${socket.id} joined room ${roomId}`);
            socketGateway.markUserOnline(user.id);

            socket.on(SOCKET_INCOMING_EVENT.ERROR, (err: Error) => {
                logger.error(`Socket error: id=${socket.id} error=${err.message}`);
            });

            socket.on(SOCKET_INCOMING_EVENT.DISCONNECT, (reason: string) => {
                logger.info(`Socket disconnected: id=${socket.id} reason=${reason}`);
                socketGateway.markUserOffline(user.id);
                socket.leave(roomId);
                logger.debug(`Socket ${socket.id} left room ${roomId}`);
            });

            socket.on(SOCKET_INCOMING_EVENT.GET_MATCH, async (formData: MatchRequest) => {
                try {
                    await matchService.handleMatchRequest(user.id, formData);
                } catch (error) {
                    logger.info(`Error handling get_match event for user ${user.id}: ${error instanceof Error ? error.message : String(error)}`);
                    socketGateway.sendErrorToUser(user.id, error instanceof Error ? error.message : String(error));
                }
            });
            socket.on(SOCKET_INCOMING_EVENT.STOP_MATCH, async () => {
                try {
                    await matchService.handleStopMatching(user.id);
                } catch (error) {
                    logger.info(`Error handling stop_matching event for user ${user.id}: ${error instanceof Error ? error.message : String(error)}`);
                    socketGateway.sendErrorToUser(user.id, error instanceof Error ? error.message : String(error));
                }
            });
            socket.on(SOCKET_INCOMING_EVENT.REQUEST_PHONE_NUMBER, async (matchId: bigint) => {
                try {
                    await matchService.handleRequestPhoneNumber(user.id, matchId)
                } catch (error) {
                    logger.info('Error while handling reques-phone-number')
                }
            })
            socket.on(SOCKET_INCOMING_EVENT.REQUEST_PHONE_NUMBER_RESPONSE, async (data: { matchId: bigint, isAccepted: boolean }) => {
                try {
                    await matchService.handleRequestPhoneNumberResponse(user.id, data.matchId, data.isAccepted)
                } catch (error) {
                    logger.info('Error while handling request-phone-number-response')
                }
            })
            socket.on(SOCKET_INCOMING_EVENT.REQUEST_VIDEO, async (matchId: bigint) => {
                try {
                    await matchService.handleRequestVideo(user.id, matchId)
                } catch (error) {
                    logger.info('Error while handling request-video')
                }
            })
            socket.on(SOCKET_INCOMING_EVENT.REQUEST_VIDEO_RESPONSE, async (data: { matchId: bigint, isAccepted: boolean }) => {
                try {
                    await matchService.handleRequestVideoResponse(user.id, data.matchId, data.isAccepted)
                } catch (error) {
                    logger.info('Error while handling request-video-response')
                }
            })
            socket.on(SOCKET_INCOMING_EVENT.DECLINE_CALL, async (matchId: bigint) => {
                try {
                    matchService.handleCallDecline(user.id, matchId)
                } catch (error) {

                }
            })
            socket.on(SOCKET_INCOMING_EVENT.REJECT_PROPOSAL, async (matchId: bigint) => {
                try {
                    matchService.handleProposalRejection(user.id, matchId)
                } catch (error) {

                }
            })
        });
    }
}

export default SocketService.getInstance();
