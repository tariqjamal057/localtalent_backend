import config from "../config";
import { MESSAGES } from "../constants/messages";
import { CALL_ENDED_BY, CALL_TYPE, PROPOSAL_STATE, STREAM_CALL_TYPE } from "../enums/call";
import { DEFAULT_LANGUAGE } from "../enums/language";
import { MATCH_STATE } from "../enums/match";
import { USER_STATUS } from "../enums/user";
import { socketGateway } from "../gateway/socket.gateway";
import { categoryRepository, CategoryRepository } from "../repositories/category.repository";
import { matchTrackingRepository, MatchTrackingRepository } from "../repositories/match-tracking.repository";
import { matchRepository, MatchRepository } from "../repositories/match.repository";
import { userBlockRepository, UserBlockRepository } from "../repositories/user-block.repository";
import { userRepository, UserRepository } from "../repositories/user.repository";
import { UserDataToJoinCall } from "../types/call.type";
import { Match } from "../types/match.types";
import { getProposalAcceptedMessage } from "../utils/call";
import logger from "../utils/logger";
import { getOtherUserIdInMatch } from "../utils/match";
import { StreamUtil } from "../utils/stream";
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
        private readonly categoryRepository: CategoryRepository,
        private readonly redisCallService: RedisCallService,
        private readonly userRepository: UserRepository,
        private readonly userBlockRepository: UserBlockRepository
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

            const [smallerUserStatus, largerUserStatus] = await Promise.all([
                this.redisUserService.getUserStatus(smallerUserId),
                this.redisUserService.getUserStatus(largerUserId),
            ]);

            if ((smallerUserStatus !== USER_STATUS.MATCHED && smallerUserStatus !== USER_STATUS.SEARCHING) || (largerUserStatus !== USER_STATUS.MATCHED && largerUserStatus !== USER_STATUS.SEARCHING)) {
                throw new Error(MESSAGES.CALL.USER_BUSY);
            }

            const [isSmallUserVideoRequestAvailable, isLargeUserVideoRequestAvailable] = await Promise.all([
                this.userWalletService.isBalanceForVideoCallAvailable(smallerUserId),
                this.userWalletService.isBalanceForVideoCallAvailable(largerUserId),
            ]);
            const callData = await StreamUtil.setupCallForUsers([
                { id: smallerUserId, name: smallerUserName, canRequestVideoCall: isSmallUserVideoRequestAvailable },
                { id: largerUserId, name: largerUserName, canRequestVideoCall: isLargeUserVideoRequestAvailable }
            ]);
            await Promise.all([
                this.redisUserService.setUserStatus(smallerUserId, USER_STATUS.IN_CALL),
                this.redisUserService.setUserStatus(largerUserId, USER_STATUS.IN_CALL),
            ]);
            const maximumCallDuration = config.streamCall.maximumCallDurationSeconds;
            CallQueue.scheduleCallEnd(matchId, maximumCallDuration * 1000);
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

    async handleCallAccepted(userId: bigint, matchId: bigint): Promise<void> {
        const match = await this.matchRepository.getById(matchId);
        if (!match || (match.recruiterUserId !== userId && match.candidateUserId !== userId)) {
            throw new Error(MESSAGES.MATCH.NOT_A_MEMBER_OF_MATCH);
        }
        const isRecruiter = match.recruiterUserId === userId;

        if ((isRecruiter && match.finalState !== MATCH_STATE.CALL_INITIATED_BY_CANDIDATE) || (!isRecruiter && match.finalState !== MATCH_STATE.CALL_INITIATED_BY_RECRUITER)) {
            throw new Error(MESSAGES.MATCH.INVALID_STATE_TO_START_CALL);
        }
        const callData = await this.createCall(match.recruiterUserId, match.candidateUserId, match.recruiterFormData?.name || '', match.candidateFormData?.name || '', matchId);
        await this.matchRepository.update(matchId, {
            finalState: isRecruiter ? MATCH_STATE.CALL_ACCEPTED_BY_RECRUITER : MATCH_STATE.CALL_ACCEPTED_BY_CANDIDATE,
            providerCallId: callData[0].callId,
            callType: callData[0].isVideoCallAllowed ? CALL_TYPE.VIDEO_CALL : CALL_TYPE.AUDIO_CALL
        });
        this.matchTrackingRepository.create({
            matchId,
            state: isRecruiter ? MATCH_STATE.CALL_ACCEPTED_BY_RECRUITER : MATCH_STATE.CALL_ACCEPTED_BY_CANDIDATE
        });
        callData.forEach(data => {
            socketGateway.sendJoinCallEventToUser(data.userId, data);
        });
    }

    async requestCall(userId: bigint, matchId: bigint): Promise<void> {
        const match = await this.matchRepository.getById(matchId);
        if (!match || (match.recruiterUserId !== userId && match.candidateUserId !== userId)) {
            throw new Error(MESSAGES.MATCH.NOT_A_MEMBER_OF_MATCH);
        }
        if (match.finalState !== MATCH_STATE.MATCHED) {
            throw new Error(MESSAGES.MATCH.INVALID_STATE_TO_INITIATE_CALL);
        }
        const isRecruiter = match.recruiterUserId === userId;
        const otherUserId = isRecruiter ? match.candidateUserId : match.recruiterUserId;
        await this.matchRepository.update(matchId, {
            finalState: isRecruiter ? MATCH_STATE.CALL_INITIATED_BY_RECRUITER : MATCH_STATE.CALL_INITIATED_BY_CANDIDATE
        });
        this.matchTrackingRepository.create({
            matchId,
            state: isRecruiter ? MATCH_STATE.CALL_INITIATED_BY_RECRUITER : MATCH_STATE.CALL_INITIATED_BY_CANDIDATE
        });
        const data = isRecruiter ? match.recruiterFormData : match.candidateFormData;
        const [categoryLevelTwo, categoryLevelThree] = await Promise.all([
            this.categoryRepository.getById(BigInt(data?.categoryLevelTwoId!), DEFAULT_LANGUAGE),
            this.categoryRepository.getById(BigInt(data?.categoryLevelThreeId!), DEFAULT_LANGUAGE)
        ]);
        socketGateway.sendIncomingCallEventToUser(otherUserId, {
            matchId: matchId,
            userId: otherUserId,
            name: data?.name || '',
            age: data?.age || 0,
            experience: data?.experience || 0,
            spokenLanguageIds: data?.spokenLanguageIds || [],
            gender: data?.gender || 0,
            rate: data?.rate || 0,
            rateType: data?.rateType || 0,
            availableTiming: data?.availableTiming || 0,
            availabilityType: data?.availabilityType || 0,
            categoryLevelTwo: categoryLevelTwo?.title || '',
            categoryLevelThree: categoryLevelThree?.title || '',
        });
    };

    async processAfterCallEnd(match: Match): Promise<void> {
        const proposalAcceptedByUsers = await this.redisCallService.getAcceptedUsers(match.id);
        let proposalState = PROPOSAL_STATE.NO_ONE_ACCEPTED;
        if (proposalAcceptedByUsers.includes(match.recruiterUserId) && proposalAcceptedByUsers.includes(match.candidateUserId)) {
            proposalState = PROPOSAL_STATE.ACCEPTED_BY_BOTH;
        } else if (proposalAcceptedByUsers.includes(match.recruiterUserId)) {
            proposalState = PROPOSAL_STATE.ACCEPTED_BY_RECRUITER;
        } else if (proposalAcceptedByUsers.includes(match.candidateUserId)) {
            proposalState = PROPOSAL_STATE.ACCEPTED_BY_CANDIDATE;
        }
        let recruiterData: { mobileNumber: string; latitude: number; longitude: number } | undefined = undefined;
        let candidateData: { mobileNumber: string; latitude: number; longitude: number } | undefined = undefined;

        if (proposalState === PROPOSAL_STATE.ACCEPTED_BY_BOTH) {
            const [recruiter, candidate] = await Promise.all([
                this.userRepository.getById(match.recruiterUserId),
                this.userRepository.getById(match.candidateUserId)
            ]);
            recruiterData = {
                mobileNumber: recruiter?.mobileNumber || '',
                latitude: match.recruiterFormData?.latitude || 0,
                longitude: match.recruiterFormData?.longitude || 0,
            }
            candidateData = {
                mobileNumber: candidate?.mobileNumber || '',
                latitude: match.candidateFormData?.latitude || 0,
                longitude: match.candidateFormData?.longitude || 0,
            }
        }
        socketGateway.sendCallEndResultEventToUser(match.recruiterUserId, {
            proposalState,
            user: candidateData,
            message: getProposalAcceptedMessage(proposalState, true)
        });
        socketGateway.sendCallEndResultEventToUser(match.candidateUserId, {
            proposalState,
            user: recruiterData,
            message: getProposalAcceptedMessage(proposalState, false)
        });
        this.redisCallService.deleteProposalAcceptedSet(match.id);
    }

    async endCall({ matchId, endBy, userIdEndingCall }: { matchId: bigint, endBy?: CALL_ENDED_BY, userIdEndingCall?: bigint }): Promise<void> {
        const match = await this.matchRepository.getById(matchId);
        if (!match) {
            throw new Error(MESSAGES.MATCH.NOT_FOUND);
        }
        if (match?.callEndedBy) {
            throw new Error(MESSAGES.CALL.ALREADY_ENDED);
        }
        if (userIdEndingCall) {
            endBy = match.recruiterUserId === userIdEndingCall ? CALL_ENDED_BY.RECRUITER : CALL_ENDED_BY.CANDIDATE;
        }
        await this.matchRepository.update(matchId, {
            callEndedBy: endBy,
            finalState: MATCH_STATE.CALL_ENDED
        });
        this.matchTrackingRepository.create({
            matchId,
            state: MATCH_STATE.CALL_ENDED
        });
        await StreamUtil.endCall(match.providerCallId!, match.callType === CALL_TYPE.VIDEO_CALL ? STREAM_CALL_TYPE.DEFAULT : STREAM_CALL_TYPE.AUDIO_CALL);
        socketGateway.sendCallEndedEventToUser(match.recruiterUserId, matchId);
        socketGateway.sendCallEndedEventToUser(match.candidateUserId, matchId);
        this.processAfterCallEnd(match);
    }

    async handleProposalAcceptance(userId: bigint, matchId: bigint): Promise<void> {
        const match = await this.matchRepository.getById(matchId);
        if (!match || (match.recruiterUserId !== userId && match.candidateUserId !== userId)) {
            throw new Error(MESSAGES.MATCH.NOT_A_MEMBER_OF_MATCH);
        }
        const hasAlreadyAccepted = await this.redisCallService.hasAccepted(matchId, userId);
        if (hasAlreadyAccepted) {
            throw new Error(MESSAGES.CALL.ALREADY_ACCEPTED_PROPOSAL);
        }
        const isRecruiter = match.recruiterUserId === userId;
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
        if (acceptedCount === match.totalUsers) {
            try {
                await Promise.all([
                    this.userWalletService.deductMatchCount(match.recruiterUserId),
                    this.userWalletService.deductMatchCount(match.candidateUserId)
                ]);
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
        const otherUserId = match.recruiterUserId === userId ? match.candidateUserId : match.recruiterUserId;
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
        const isRecruiter = match?.recruiterUserId === userId;
        await this.matchRepository.update(matchId, {
            finalState: isRecruiter ? MATCH_STATE.RECRUITER_BLOCKED_CANDIDATE : MATCH_STATE.CANDIDATE_BLOCKED_RECRUITER
        });
        await this.userBlockRepository.block(userId, otherUserId);
        this.matchTrackingRepository.create({
            matchId,
            state: isRecruiter ? MATCH_STATE.RECRUITER_BLOCKED_CANDIDATE : MATCH_STATE.CANDIDATE_BLOCKED_RECRUITER
        });
    }
}

export const callService = new CallService(
    matchRepository,
    redisUserService,
    userWalletService,
    matchTrackingRepository,
    categoryRepository,
    redisCallService,
    userRepository,
    userBlockRepository
);