import { SocketService } from "../config/socket";
import { SOCKET_OUTGOING_EVENT } from "../enums/socket";
import { USER_STATUS } from "../enums/user";
import logger from "../utils/logger";
import { redisUserService } from "../services/redis/redis-user.service";
import { CallEndResult, MatchResponse } from "../types/socket-data.type";
import { UserDataToJoinCall } from "../types/call.type";
import { CALL_ENDED_BY } from "../enums/call";
import { UserDataToJoinChat } from "../types/chat.type";

class SocketGateway {

    private socketService;

    constructor(socketService: SocketService) {
        this.socketService = socketService;
    }

    //incoming events from Socket.IO connections
    public async markUserOnline(userId: bigint) {
        try {
            logger.info(`Marking user online: userId=${userId}`);
            await redisUserService.setUserStatus(userId, USER_STATUS.ONLINE);
            logger.debug(`User ${userId} marked ONLINE in Redis`);
        } catch (error) {
            logger.error(`Failed to mark user ${userId} online: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async markUserOffline(userId: bigint) {
        try {
            logger.info(`Marking user offline: userId=${userId}`);
            redisUserService.setUserStatus(userId, USER_STATUS.OFFLINE);
            redisUserService.clearAllUserData(userId);
            logger.debug(`User ${userId} marked OFFLINE in Redis`);
        } catch (error) {
            logger.error(`Failed to mark user ${userId} offline: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    //outgoing events to Socket.IO connections

    public async sendErrorToUser(userId: bigint, errorMessage: string): Promise<void> {
        try {
            logger.info(`Sending error to user ${userId}: ${errorMessage}`);
            this.socketService.emitToUser(userId, SOCKET_OUTGOING_EVENT.ERROR, { message: errorMessage });
        } catch (error) {
            logger.error(`Failed to send error to user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async sendMatchToUser(userId: bigint, matchData: MatchResponse): Promise<void> {
        try {
            this.socketService.emitToUser(userId, SOCKET_OUTGOING_EVENT.MATCH_FOUND, matchData);
        } catch (error) {
            logger.error(`Failed to send match data to user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async sendJoinCallEventToUser(userId: bigint, callData: UserDataToJoinCall): Promise<void> {
        try {
            logger.info(`Sending join call event to user ${userId} for call ${callData.callId}`);
            this.socketService.emitToUser(userId, SOCKET_OUTGOING_EVENT.JOIN_CALL, callData);
        } catch (error) {
            logger.error(`Failed to send join call event to user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async sendIncomingCallEventToUser(userId: bigint, formData: MatchResponse): Promise<void> {
        try {
            logger.info(`Sending incoming call event to user ${userId} with caller data: ${JSON.stringify(formData)}`);
            this.socketService.emitToUser(userId, SOCKET_OUTGOING_EVENT.INCOMING_CALL, formData);
        } catch (error) {
            logger.error(`Failed to send incoming call event to user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async sendCallEndResultEventToUser(userId: bigint, callEndResult: CallEndResult): Promise<void> {
        try {
            logger.info(`Sending call end result to user ${userId} with data: ${JSON.stringify(callEndResult)}`);
            this.socketService.emitToUser(userId, SOCKET_OUTGOING_EVENT.CALL_END_RESULT, callEndResult);
        } catch (error) {
            logger.error(`Failed to send call end result to user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async sendVideoRequestEventToUser(userId: bigint, matchId: bigint): Promise<void> {
        try {
            logger.info(`Sending video request event to user ${userId} for match ${matchId}`);
            this.socketService.emitToUser(userId, SOCKET_OUTGOING_EVENT.VIDEO_REQUEST, { matchId });
        } catch (error) {
            logger.error(`Failed to send video request event to user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async sendCallEndedEvent(userId: bigint, data: { matchId: bigint, callEndedBy: CALL_ENDED_BY, message: string, proposalAutoCancelTimeoutSeconds: number }): Promise<void> {
        try {
            logger.info(`Sending call ended event to user ${userId} for match ${data.matchId} with message: ${data.message}`);
            this.socketService.emitToUser(userId, SOCKET_OUTGOING_EVENT.CALL_ENDED, data);
        } catch (error) {
            logger.error(`Failed to send call ended event to user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async sendAllAcceptedProposalEvent(userId: bigint, data: {
        matchId: bigint, userData: {
            latitude: number, longitude: number, name: string | undefined | null
        }, chatData: UserDataToJoinChat
    }): Promise<void> {
        try {
            this.socketService.emitToUser(userId, SOCKET_OUTGOING_EVENT.ALL_ACCEPTED_PROPOSAL, {
                matchId: data.matchId,
                userData: data.userData,
                chatData: data.chatData
            });
        } catch (error) {
            logger.error(`Failed to send all accepted proposal event to user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
export const socketGateway = new SocketGateway(SocketService.getInstance());
