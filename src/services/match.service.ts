import { matchRepository, MatchRepository, Match, UpdateMatchDto } from '../repositories/match.repository';
import { MATCH_STATE, SEARCH_CHANGE_TYPE, SEARCH_TYPE } from '../enums/match';
import { MatchRequest, MatchResponse } from '../types/socket-data.type';
import { redisUserService, RedisUserService } from './redis/redis-user.service';
import logger from '../utils/logger';
import { userBlockRepository, UserBlockRepository } from '../repositories/user-block.repository';
import { calculateDistanceKm } from '../utils/match';
import { USER_STATUS } from '../enums/user';
import { categoryRepository, CategoryRepository } from '../repositories/category.repository';
import { DEFAULT_LANGUAGE } from '../enums/language';
import { matchTrackingRepository, MatchTrackingRepository } from '../repositories/match-tracking.repository';
import { socketGateway } from '../gateway/socket.gateway';
import config from '../config';
import { userWalletService, UserWalletService } from './user-wallet.service';
import { MESSAGES } from '../constants/messages';

export class MatchService {
    constructor(
        private readonly matchRepository: MatchRepository,
        private readonly redisUserService: RedisUserService,
        private readonly userBlockRepository: UserBlockRepository,
        private readonly categoryRepository: CategoryRepository,
        private readonly matchTrackingRepository: MatchTrackingRepository,
        private readonly userWalletService: UserWalletService
    ) { }

    async getAcceptedMatches(userId: bigint): Promise<Match[]> {
        return this.matchRepository.getByUserIdAndFinalState(userId, MATCH_STATE.PROPOSAL_ACCEPTED_BY_BOTH);
    }

    async getMatchedUserPriorityScore(userSearchData: MatchRequest, matchedUserSearchData: MatchRequest): Promise<number> {
        logger.debug(`[MatchService] Calculating priority score between user search data: ${JSON.stringify(userSearchData)} and matched user search data: ${JSON.stringify(matchedUserSearchData)}`);

        const distance = calculateDistanceKm(userSearchData.latitude, userSearchData.longitude, matchedUserSearchData.latitude, matchedUserSearchData.longitude);
        logger.debug(`[MatchService] Calculated distance between users: ${distance} km`);

        if (distance > userSearchData.searchRadiusKm || distance > matchedUserSearchData.searchRadiusKm) {
            logger.debug(`[MatchService] Users are outside each other's search radius. Returning score of Infinity.`);
            return Number.POSITIVE_INFINITY;
        }

        if (userSearchData.categoryLevelThreeId === matchedUserSearchData.categoryLevelThreeId) {
            logger.debug(`[MatchService] Both users have the same category level three ID. Returning score of 1.`);
            return 1;
        } else if (userSearchData.categoryLevelTwoId === matchedUserSearchData.categoryLevelTwoId) {
            logger.debug(`[MatchService] Both users have the same category level two ID. Returning score of 2.`);
            return 2;
        } else if (userSearchData.categoryLevelOneId === matchedUserSearchData.categoryLevelOneId) {
            logger.debug(`[MatchService] Both users have the same category level one ID. Returning score of 3.`);
            return 3;
        }

        logger.debug(`[MatchService] Users do not share the same category at any level. Returning score of Infinity.`);
        return Number.POSITIVE_INFINITY;
    };

    async getTopMatchForUser(userId: bigint, userData?: MatchRequest): Promise<MatchResponse | null> {

        const userSearchData = userData ?? await this.redisUserService.getUserSearchData(userId);
        if (!userSearchData) {
            logger.warn(`[MatchService] No search data found for user ${userId}. Cannot send match.`);
            return null;
        }

        let iterationNumber = 0;

        while (true) {
            iterationNumber++;
            logger.debug(`[MatchService] Attempting to get top match for user ${userId}, iteration ${iterationNumber}`);

            const topMatchElements = await this.redisUserService.popFromPriorityQueue(userId, config.matching.PRIORITY_QUEUE_BATCH_SIZE);
            logger.debug(`[MatchService] Retrieved ${topMatchElements.length} elements from priority queue for user ${userId} in iteration ${iterationNumber} and topMatchelements.`);
            if (!topMatchElements || topMatchElements.length === 0) {
                logger.info(`[MatchService] Priority queue exhausted for user ${userId}. No match found.`);
                return null;
            }

            for (const matchedUserId of topMatchElements) {
                logger.debug(`[MatchService] Evaluating candidate ${matchedUserId} for user ${userId}.`);

                const topUserStatus = await this.redisUserService.getUserStatus(matchedUserId);
                if (topUserStatus !== USER_STATUS.SEARCHING && topUserStatus !== USER_STATUS.MATCHED) {
                    logger.debug(`[MatchService] Candidate ${matchedUserId} not searching (status: ${topUserStatus}). Skipping.`);
                    continue;
                }

                const matchedUserSearchData = await this.redisUserService.getUserSearchData(matchedUserId);
                if (!matchedUserSearchData) {
                    logger.debug(`[MatchService] No search data found for candidate ${matchedUserId}. Skipping.`);
                    continue;
                }

                if (matchedUserSearchData.searchType === userSearchData.searchType) {
                    logger.debug(`[MatchService] Candidate ${matchedUserId} has same search type as user ${userId}. Skipping.`);
                    continue;
                }

                const [categoryLevelTwo, categoryLevelThree] = await Promise.all([
                    this.categoryRepository.getById(BigInt(matchedUserSearchData.categoryLevelTwoId), DEFAULT_LANGUAGE),
                    this.categoryRepository.getById(BigInt(matchedUserSearchData.categoryLevelThreeId), DEFAULT_LANGUAGE)
                ]);

                const recruiterData = userSearchData.searchType === SEARCH_TYPE.RECRUITER ? userSearchData : matchedUserSearchData;
                const candidateData = userSearchData.searchType === SEARCH_TYPE.CANDIDATE ? userSearchData : matchedUserSearchData;
                const recruiterUserId = userSearchData.searchType === SEARCH_TYPE.RECRUITER ? userId : matchedUserId;
                const candidateUserId = userSearchData.searchType === SEARCH_TYPE.CANDIDATE ? userId : matchedUserId;

                const match = await this.matchRepository.create({
                    recruiterUserId,
                    candidateUserId,
                    recruiterFormData: recruiterData,
                    candidateFormData: candidateData,
                    totalUsers: 2,
                    finalState: MATCH_STATE.MATCHED
                });
                this.matchTrackingRepository.create({
                    matchId: match.id,
                    state: MATCH_STATE.MATCHED
                });

                logger.info(`[MatchService] Created match with ID ${match.id} between user ${recruiterUserId} and user ${candidateUserId}.`);

                return {
                    matchId: Number(match.id),
                    userId: Number(matchedUserId),
                    name: matchedUserSearchData.name,
                    age: matchedUserSearchData.age,
                    experience: matchedUserSearchData.experience,
                    spokenLanguageIds: matchedUserSearchData.spokenLanguageIds,
                    categoryLevelTwo: categoryLevelTwo ? categoryLevelTwo.title : '',
                    categoryLevelThree: categoryLevelThree ? categoryLevelThree.title : '',
                    rate: matchedUserSearchData.rate,
                    rateType: matchedUserSearchData.rateType,
                    availableTiming: matchedUserSearchData.availableTiming,
                    availabilityType: matchedUserSearchData.availabilityType,
                    gender: matchedUserSearchData.gender
                };
            }
        }
    };

    async sendTopMatchToUser(userId: bigint): Promise<void> {
        const userStatus = await this.redisUserService.getUserStatus(userId);
        if (userStatus !== USER_STATUS.SEARCHING) {
            logger.info(`[MatchService] User ${userId} is not currently searching (status: ${userStatus}). Will not send top match.`);
            return;
        }
        const topMatch = await this.getTopMatchForUser(userId);
        if (topMatch) {
            logger.info(`[MatchService] Sending top match with ID ${topMatch.matchId} to user ${userId}.`);
            await this.redisUserService.setUserStatus(userId, USER_STATUS.MATCHED);
            await this.redisUserService.addToSeenSet(userId, BigInt(topMatch.userId));
            logger.info(`[MatchService] Updated status to MATCHED for user ${userId} in Redis.`);
            socketGateway.sendMatchToUser(userId, topMatch);
        } else {
            logger.info(`[MatchService] No top match found to send to user ${userId}.`);
        }
    }
    async addPotentialUserToPriorityQueue(userId: bigint, matchedUserId: bigint, priority: number): Promise<void> {
        if (matchedUserId === userId) {
            logger.debug(`[MatchService] Skipping adding user ${userId} to their own priority queue.`);
            return;
        }
        const size = await this.redisUserService.pushToPriorityQueueAndGetSize(userId, matchedUserId.toString(), priority);
        logger.debug(`[MatchService] Added candidate ${matchedUserId} to priority queue for user ${userId} (priority=${priority}, queueSize=${size}).`);
        if (size === 1) {
            logger.info(`[MatchService] Priority queue ready for user ${userId}. Triggering top match send.`);
            this.sendTopMatchToUser(userId);
        }
    };

    async addPotentialUsersToPriorityQueue(userId: bigint, matchedUserIds: bigint[]): Promise<void> {
        logger.debug(`[MatchService] Adding ${matchedUserIds.length} candidates to priority queue for user ${userId}.`);

        const userSearchData = await this.redisUserService.getUserSearchData(userId);
        if (!userSearchData) {
            logger.warn(`[MatchService] No search data found for user ${userId}. Cannot calculate priority scores.`);
            return;
        }

        const previousSize = await this.redisUserService.sizeOfPriorityQueue(userId);
        logger.debug(`[MatchService] Previous priority queue size for user ${userId}: ${previousSize}`);

        const itemsToAdd: { element: string, priority: number }[] = [];
        for (const matchedUserId of matchedUserIds) {
            if (matchedUserId === userId) {
                logger.debug(`[MatchService] Skipping adding user ${userId} to their own priority queue.`);
                continue;
            }
            const matchedUserSearchData = await this.redisUserService.getUserSearchData(BigInt(matchedUserId));
            if (!matchedUserSearchData) {
                logger.warn(`[MatchService] No search data found for matched user ${matchedUserId}. Skipping.`);
                continue;
            }

            const priorityScore = await this.getMatchedUserPriorityScore(userSearchData, matchedUserSearchData);
            if (priorityScore === Number.POSITIVE_INFINITY) {
                logger.debug(`[MatchService] Candidate ${matchedUserId} outside match criteria. Skipping.`);
                continue;
            }

            itemsToAdd.push({ element: matchedUserId.toString(), priority: priorityScore });
            //adding to other user's priority queue as well
            this.addPotentialUserToPriorityQueue(matchedUserId, userId, priorityScore);
        }

        if (itemsToAdd.length > 0) {
            await this.redisUserService.pushMultipleItemsToPriorityQueue(userId, itemsToAdd);
            logger.debug(`[MatchService] Added ${itemsToAdd.length} items to priority queue for user ${userId}.`);

            if (previousSize === 0) {
                logger.info(`[MatchService] Priority queue ready for user ${userId}. Triggering top match send.`);
                this.sendTopMatchToUser(userId);
            }

        } else {
            logger.debug(`[MatchService] No valid candidates to add to priority queue for user ${userId}.`);
        }
    };

    async buildPriorityQueueForUser(userId: bigint, formData: MatchRequest): Promise<void> {
        logger.debug(`[MatchService] Building priority queue for user ${userId}.`);

        const potentialUsersWithinRadius = await this.redisUserService.getUsersWithinRadius(userId, formData.searchRadiusKm);
        logger.info(`[MatchService] Found ${potentialUsersWithinRadius.length} potential users within radius for user ${userId}.`);

        await this.addPotentialUsersToPriorityQueue(userId, potentialUsersWithinRadius.map(id => BigInt(id)));
    }

    isSameSpokenLanguages(langs1: number[], langs2: number[]): boolean {
        const sortedLangs1 = [...langs1].sort();
        const sortedLangs2 = [...langs2].sort();
        if (sortedLangs1.length !== sortedLangs2.length) {
            return false;
        }
        for (let i = 0; i < sortedLangs1.length; i++) {
            if (sortedLangs1[i] !== sortedLangs2[i]) {
                return false;
            }
        }
        return true;
    }
    isSameSearchData(data1: MatchRequest, data2: MatchRequest): SEARCH_CHANGE_TYPE {
        if (data1.categoryLevelOneId !== data2.categoryLevelOneId ||
            data1.categoryLevelTwoId !== data2.categoryLevelTwoId ||
            data1.categoryLevelThreeId !== data2.categoryLevelThreeId ||
            data1.latitude !== data2.latitude ||
            data1.longitude !== data2.longitude ||
            data1.searchRadiusKm !== data2.searchRadiusKm ||
            data1.searchType !== data2.searchType
        ) {
            //critical change need to rebuild all
            return SEARCH_CHANGE_TYPE.CRITICAL_CHANGE;
        }
        if (data1.name !== data2.name ||
            data1.age !== data2.age ||
            data1.experience !== data2.experience ||
            !this.isSameSpokenLanguages(data1.spokenLanguageIds, data2.spokenLanguageIds) ||
            data1.gender !== data2.gender ||
            data1.rate !== data2.rate ||
            data1.rateType !== data2.rateType ||
            data1.availableTiming !== data2.availableTiming ||
            data1.availabilityType !== data2.availabilityType
        ) {
            //non critical change, need to override current search data but can keep priority queue and seen data as is
            return SEARCH_CHANGE_TYPE.NON_CRITICAL_CHANGE;
        }
        //no change
        return SEARCH_CHANGE_TYPE.NO_CHANGE;
    }

    async handleMatchRequest(userId: bigint, formData: MatchRequest): Promise<void> {
        logger.info(`[MatchService] Handling match request for user ${userId}.`);
        logger.debug(`[MatchService] Match request data for user ${userId}: ${JSON.stringify(formData)}`);

        const isBalanceAvailable = await this.userWalletService.isBalanceAvailiableToSearch(userId);
        if (!isBalanceAvailable) {
            logger.info(`[MatchService] User ${userId} does not have available balance to search. Sending error.`);
            throw new Error(MESSAGES.SEARCH.INSUFFICIENT_BALANCE);
        }

        const existingSearchData = await this.redisUserService.getUserSearchData(userId);

        if (existingSearchData) {
            const changeType = this.isSameSearchData(existingSearchData, formData);
            if (changeType === SEARCH_CHANGE_TYPE.NO_CHANGE) {
                await this.redisUserService.setUserStatus(userId, USER_STATUS.SEARCHING);
                logger.info(`[MatchService] No search data changes for user ${userId}. Resuming match search.`);
                return this.sendTopMatchToUser(userId);
            } else if (changeType === SEARCH_CHANGE_TYPE.NON_CRITICAL_CHANGE) {
                await this.redisUserService.setUserSearchData(userId, { ...formData, spokenLanguageIds: JSON.stringify(formData.spokenLanguageIds) });
                await this.redisUserService.setUserStatus(userId, USER_STATUS.SEARCHING);
                logger.info(`[MatchService] Non-critical search data updated for user ${userId}. Resuming match search.`);
                return this.sendTopMatchToUser(userId);
            }
        }

        await this.redisUserService.setUserSearchData(userId, { ...formData, spokenLanguageIds: JSON.stringify(formData.spokenLanguageIds) });
        logger.debug(`[MatchService] Search data stored in Redis for user ${userId}.`);

        await this.redisUserService.setUserGeo(userId, formData.latitude, formData.longitude);
        logger.debug(`[MatchService] Geo data stored in Redis for user ${userId}: lat=${formData.latitude}, lon=${formData.longitude}.`);

        const userBlockedUserIds = await this.userBlockRepository.getAllByUserId(userId).then(blocks => blocks.map(block => block.blockedUserId));
        logger.debug(`[MatchService] Loaded ${userBlockedUserIds.length} blocked user IDs for user ${userId}.`);

        await this.redisUserService.addManyToSeenSet(userId, userBlockedUserIds);
        logger.debug(`[MatchService] Blocked users added to seen set for user ${userId}.`);

        await this.redisUserService.setUserStatus(userId, USER_STATUS.SEARCHING);
        await this.buildPriorityQueueForUser(userId, formData);
    }

    async updateState(matchId: bigint, newState: MATCH_STATE, additionalFields?: UpdateMatchDto): Promise<void> {
        if (additionalFields) {
            await this.matchRepository.update(matchId, { ...additionalFields, finalState: newState });
        } else {
            await this.matchRepository.updateFinalState(matchId, newState);
        }
        this.matchTrackingRepository.create({
            matchId: matchId,
            state: newState
        });
    }
}

export const matchService = new MatchService(matchRepository, redisUserService, userBlockRepository, categoryRepository, matchTrackingRepository, userWalletService);
