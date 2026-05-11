import config from "../config";
import { MESSAGES } from "../constants/messages";
import { CALL_ENDED_BY, CALL_TYPE, PROPOSAL_STATE } from "../enums/call";
import { DEFAULT_LANGUAGE } from "../enums/language";
import { MATCH_STATE } from "../enums/match";
import { USER_STATUS } from "../enums/user";
import { socketGateway } from "../gateway/socket.gateway";
import { categoryRepository, CategoryRepository } from "../repositories/category.repository";
import { matchTrackingRepository, MatchTrackingRepository } from "../repositories/match-tracking.repository";
import { matchRepository, MatchRepository } from "../repositories/match.repository";
import { userRepository, UserRepository } from "../repositories/user.repository";
import { UserDataToJoinCall } from "../types/call.type";
import { Match } from "../types/match.types";
import { getProposalAcceptedMessage } from "../utils/call";
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
        private readonly userRepository: UserRepository
    ) { }

    async createCall(userId1: bigint, userId2: bigint, user1Name: string, user2Name: string, matchId: bigint): Promise<UserDataToJoinCall[]> {

        const smallerUserId = userId1 < userId2 ? userId1 : userId2;
        const largerUserId = userId1 < userId2 ? userId2 : userId1;

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
            const isVideoCall = isSmallUserVideoRequestAvailable || isLargeUserVideoRequestAvailable;
            const callData = await StreamUtil.setupCallForUsers([
                { id: userId1, name: user1Name },
                { id: userId2, name: user2Name }
            ], isVideoCall ? CALL_TYPE.DEFAULT : CALL_TYPE.AUDIO_CALL);
            await Promise.all([
                this.redisUserService.setUserStatus(userId1, USER_STATUS.IN_CALL),
                this.redisUserService.setUserStatus(userId2, USER_STATUS.IN_CALL),
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
        await this.matchRepository.update(matchId, {
            finalState: isRecruiter ? MATCH_STATE.CALL_ACCEPTED_BY_RECRUITER : MATCH_STATE.CALL_ACCEPTED_BY_CANDIDATE
        });
        this.matchTrackingRepository.create({
            matchId,
            state: isRecruiter ? MATCH_STATE.CALL_ACCEPTED_BY_RECRUITER : MATCH_STATE.CALL_ACCEPTED_BY_CANDIDATE
        });
        const callData = await this.createCall(match.recruiterUserId, match.candidateUserId, match.recruiterFormData?.name || '', match.candidateFormData?.name || '', matchId);
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
        await this.redisCallService.acceptProposal(matchId, userId);
        const acceptedUsers = await this.redisCallService.getAcceptedUsers(matchId);
    }
}

export const callService = new CallService(
    matchRepository,
    redisUserService,
    userWalletService,
    matchTrackingRepository,
    categoryRepository,
    redisCallService,
    userRepository
);