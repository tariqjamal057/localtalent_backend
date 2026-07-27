import config from "../config";
import { MESSAGES } from "../constants/messages";
import { CALL_ENDED_BY } from "../enums/call";
import { MATCH_STATE } from "../enums/match";
import { USER_STATUS } from "../enums/user";
import { socketGateway } from "../gateway/socket.gateway";
import { matchTrackingRepository, MatchTrackingRepository } from "../repositories/match-tracking.repository";
import { Match, matchRepository, MatchRepository } from "../repositories/match.repository";
import { userBlockRepository, UserBlockRepository } from "../repositories/user-block.repository";
import { userProfileRepository, UserProfileRepository } from "../repositories/user-profile.repository";
import { UserDataToJoinCall } from "../types/call.type";
import { getCallEndedMessage } from "../utils/call";
import logger from "../utils/logger";
import { getOtherUserIdInMatch } from "../utils/match";
import { StreamUtil } from "../utils/stream";
import { customChatService } from "./custom-chat.service";
import CallQueue from "./queue/call.queue";
import { redisCallService, RedisCallService } from "./redis/redis-call.service";
import { redisUserService, RedisUserService } from "./redis/redis-user.service";
import { userWalletService, UserWalletService } from "./user-wallet.service";

export class CallService {

    constructor(
        private readonly matchRepository: MatchRepository,
        private readonly redisUserService: RedisUserService,
        private readonly userWalletService: UserWalletService,
        private readonly matchTrackingRepository: MatchTrackingRepository,
        private readonly redisCallService: RedisCallService,
        private readonly userBlockRepository: UserBlockRepository,
        private readonly userProfileRepository: UserProfileRepository
    ) { }

    async createCall(userId1: bigint, userId2: bigint, user1Name: string, user2Name: string, matchId: bigint): Promise<UserDataToJoinCall[]> {

        const smallerUserId = userId1 < userId2 ? userId1 : userId2;
        const largerUserId = userId1 < userId2 ? userId2 : userId1;
        const smallerUserName = userId1 < userId2 ? user1Name : user2Name;
        const largerUserName = userId1 < userId2 ? user2Name : user1Name;

        let gotlockOnSmallerId = false;
        let gotlockOnLargerId = false;

        try {
            gotlockOnSmallerId = await this.redisUserService.acquireLockWithRetry(smallerUserId, config.call.USER_LOCK_TTL_SECONDS);
            if (!gotlockOnSmallerId) {
                throw new Error(MESSAGES.CALL.USER_LOCKED);
            }
            gotlockOnLargerId = await this.redisUserService.acquireLockWithRetry(largerUserId, config.call.USER_LOCK_TTL_SECONDS);
            if (!gotlockOnLargerId) {
                throw new Error(MESSAGES.CALL.USER_LOCKED);
            }

            const [isSmallUserVideoRequestAvailable, isLargeUserVideoRequestAvailable] = await Promise.all([
                this.userWalletService.isBalanceForVideoCallAvailable(smallerUserId),
                this.userWalletService.isBalanceForVideoCallAvailable(largerUserId),
            ]);
            const callData = await StreamUtil.setupCallForUsers([
                { id: smallerUserId, name: smallerUserName, canRequestVideoCall: isSmallUserVideoRequestAvailable },
                { id: largerUserId, name: largerUserName, canRequestVideoCall: isLargeUserVideoRequestAvailable }
            ]);
            // await this.redisCallService.setOngoingCall(matchId, {
            //     [ONGOING_CALL_KEYS.STREAM_CALL_ID]: callData[0].callId,
            //     [ONGOING_CALL_KEYS.USER_1_ID]: smallerUserId.toString(),
            //     [ONGOING_CALL_KEYS.USER_2_ID]: largerUserId.toString(),
            //     [ONGOING_CALL_KEYS.IS_USER_1_JOINED]: false,
            //     [ONGOING_CALL_KEYS.IS_USER_2_JOINED]: false,
            //     [ONGOING_CALL_KEYS.IS_USER_1_ACCEPTED_PROPOSAL]: false,
            //     [ONGOING_CALL_KEYS.IS_USER_2_ACCEPTED_PROPOSAL]: false
            // });
            const maximumCallDuration = config.streamCall.maximumCallDurationSeconds;
            CallQueue.scheduleCallEnd(matchId, maximumCallDuration * 1000);
            await Promise.all([
                this.redisUserService.setUserStatus(smallerUserId, USER_STATUS.MATCHED),
                this.redisUserService.setUserStatus(largerUserId, USER_STATUS.MATCHED)
            ]);
            return callData;
        } catch (error) {
            throw error;
        } finally {
            if (gotlockOnLargerId) {
                this.redisUserService.releaseLock(largerUserId);
            }
            if (gotlockOnSmallerId) {
                this.redisUserService.releaseLock(smallerUserId);
            }
        }
    }

    async processAllAcceptedProposalState(matchId: Match): Promise<void> {
        const recruiterUserId = matchId.recruiterUserId;
        const candidateUserId = matchId.candidateUserId;
        const [
            recruiterSearchData,
            candidateSearchData,
            recruiterProfile,
            candidateProfile
        ] = await Promise.all([
            this.redisUserService.getUserSearchData(recruiterUserId),
            this.redisUserService.getUserSearchData(candidateUserId),
            this.userProfileRepository.getByUserId(recruiterUserId),
            this.userProfileRepository.getByUserId(candidateUserId)
        ]);
        if (!recruiterSearchData || !candidateSearchData) {
            logger.error('Missing search data for users in match', { matchId: matchId.id, recruiterUserId, candidateUserId });
            return;
        }
        const chatRoom = await customChatService.createRoom(matchId.id, recruiterUserId, candidateUserId);
        const recruiterData = {
            latitude: recruiterSearchData.latitude,
            longitude: recruiterSearchData.longitude,
            name: recruiterProfile?.fullName
        }
        const candidateData = {
            latitude: candidateSearchData.latitude,
            longitude: candidateSearchData.longitude,
            name: candidateProfile?.fullName
        }
        logger.info("ALL accepted proposal")
        const chatData = {
            chatRoomId: chatRoom.id.toString(),
        };
        socketGateway.sendAllAcceptedProposalEvent(recruiterUserId, {
            matchId: matchId.id,
            userData: candidateData,
            chatData
        });
        socketGateway.sendAllAcceptedProposalEvent(candidateUserId, {
            matchId: matchId.id,
            userData: recruiterData,
            chatData
        });
    }
    async handleProposalAcceptance(userId: bigint, matchId: bigint): Promise<void> {
        const match = await this.matchRepository.getById(matchId);
        if (!match || (match.recruiterUserId != userId && match.candidateUserId != userId)) {
            throw new Error(MESSAGES.MATCH.NOT_A_MEMBER_OF_MATCH);
        }
        const hasAlreadyAccepted = await this.redisCallService.hasAccepted(matchId, userId);
        if (hasAlreadyAccepted) {
            throw new Error(MESSAGES.CALL.ALREADY_ACCEPTED_PROPOSAL);
        }
        const isRecruiter = match.recruiterUserId == userId;
        const isAccepted = await this.redisCallService.acceptProposal(matchId, userId);
        if (!isAccepted) {
            throw new Error(MESSAGES.CALL.FAILED_TO_ACCEPT_PROPOSAL);
        }
        await this.matchRepository.update(matchId, {
            proposalAcceptedCount: (match.proposalAcceptedCount || 0) + 1,
            finalState: isRecruiter ? MATCH_STATE.PROPOSAL_ACCEPTED_BY_RECRUITER : MATCH_STATE.PROPOSAL_ACCEPTED_BY_CANDIDATE
        });
        this.matchTrackingRepository.create({
            matchId,
            state: isRecruiter ? MATCH_STATE.PROPOSAL_ACCEPTED_BY_RECRUITER : MATCH_STATE.PROPOSAL_ACCEPTED_BY_CANDIDATE
        });
        const acceptedCount = await this.redisCallService.getAcceptedCount(matchId);
        logger.info("Proposal accepted count", { acceptedCount })
        if (acceptedCount === match.totalUsers) {
            try {
                await Promise.all([
                    this.userWalletService.deductMatchCount(match.recruiterUserId),
                    this.userWalletService.deductMatchCount(match.candidateUserId),
                    this.redisCallService.deleteProposalAcceptedSet(matchId)
                ]);
                this.processAllAcceptedProposalState(match);
            } catch (error) {
                logger.error('Error deducting match count after proposal acceptance', { error, matchId });
                await this.redisCallService.deleteProposalAcceptedSet(matchId);
            }
        }
    }

    async handleVideoRequest(userId: bigint, matchId: bigint) {
        const match = await this.matchRepository.getById(matchId);
        if (!match || (match.recruiterUserId !== userId && match.candidateUserId !== userId)) {
            throw new Error(MESSAGES.MATCH.NOT_A_MEMBER_OF_MATCH);
        }
        const otherUserId = match.recruiterUserId == userId ? match.candidateUserId : match.recruiterUserId;
        const isVideoRequestAvailable = await this.userWalletService.isBalanceForVideoCallAvailable(userId);
        if (!isVideoRequestAvailable) {
            throw new Error(MESSAGES.CALL.INSUFFICIENT_BALANCE_FOR_VIDEO_CALL);
        }
        await this.userWalletService.deductVideoRequestCount(userId);
        socketGateway.sendVideoRequestEventToUser(otherUserId, matchId);
    }

    async handleBlocking(userId: bigint, matchId: bigint): Promise<void> {
        const match = await this.matchRepository.getById(matchId);
        const otherUserId = getOtherUserIdInMatch(match!, userId);
        await this.userBlockRepository.block(userId, otherUserId);
    }

    async handleCallEnd({ matchId, callEndBy, userId }: { matchId: bigint, callEndBy?: CALL_ENDED_BY, userId?: bigint }): Promise<void> {
        if (!callEndBy && !userId) {
            throw new Error(MESSAGES.CALL.INVALID_CALL_END_PARAMETERS);
        }
        const match = await this.matchRepository.getById(matchId);
        if (!match || match.callEndedBy) {
            throw new Error(MESSAGES.CALL.ALREADY_ENDED);
        }
        let endBy = callEndBy;
        if (userId) {
            const isRecruiter = match?.recruiterUserId == userId;
            endBy = isRecruiter ? CALL_ENDED_BY.RECRUITER : CALL_ENDED_BY.CANDIDATE;
        }
        await this.matchRepository.update(matchId, {
            finalState: MATCH_STATE.CALL_ENDED,
            callEndedBy: endBy
        });
        CallQueue.cancelScheduledCallEnd(matchId.toString());
        socketGateway.sendCallEndedEvent(match.recruiterUserId, {
            matchId,
            callEndedBy: endBy!,
            message: getCallEndedMessage(endBy!, true),
            proposalAutoCancelTimeoutSeconds: config.call.PROPOSAL_AUTO_CANCEL_TIMEOUT_SECONDS
        });
        socketGateway.sendCallEndedEvent(match.candidateUserId, {
            matchId,
            callEndedBy: endBy!,
            message: getCallEndedMessage(endBy!, false),
            proposalAutoCancelTimeoutSeconds: config.call.PROPOSAL_AUTO_CANCEL_TIMEOUT_SECONDS
        });
    }
}

export const callService = new CallService(
    matchRepository,
    redisUserService,
    userWalletService,
    matchTrackingRepository,
    redisCallService,
    userBlockRepository,
    userProfileRepository
);