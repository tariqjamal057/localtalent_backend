import { PROPOSAL_STATE } from "../enums/call";

export const getProposalAcceptedMessage = (proposalState: PROPOSAL_STATE, isMesageForRecruiter: boolean): string => {
    switch (proposalState) {
        case PROPOSAL_STATE.NO_ONE_ACCEPTED:
            return 'No one accepted the proposal.';
        case PROPOSAL_STATE.ACCEPTED_BY_RECRUITER:
            return isMesageForRecruiter ? 'You have accepted the proposal. Candidate does not accepted it' : 'Recruiter has accepted the proposal, But you have not accepted it';
        case PROPOSAL_STATE.ACCEPTED_BY_CANDIDATE:
            return isMesageForRecruiter ? 'Candidate has accepted the proposal, But you have not accepted it' : 'You have accepted the proposal. Recruiter does not accepted it';
        case PROPOSAL_STATE.ACCEPTED_BY_BOTH:
            return 'Both parties have accepted the proposal';
        default:
            return '';
    }
}