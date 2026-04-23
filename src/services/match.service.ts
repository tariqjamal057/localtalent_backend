import { matchRepository, MatchRepository, Match } from '../repositories/match.repository';
import { MATCH_STATE } from '../enums/match';

export class MatchService {
    constructor(private readonly matchRepository: MatchRepository) { }

    async getAcceptedMatches(userId: bigint): Promise<Match[]> {
        return this.matchRepository.getByUserIdAndFinalState(userId, MATCH_STATE.PROPOSAL_ACCEPTED_BY_BOTH);
    }
}

export const matchService = new MatchService(matchRepository);
