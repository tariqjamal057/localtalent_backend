import { CALL_ENDED_BY, PROPOSAL_STATE } from "../enums/call";

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

export const getCallEndedMessage = (callEndedBy: CALL_ENDED_BY, isMessageForRecruiter: boolean): string => {
    switch (callEndedBy) {
        case CALL_ENDED_BY.RECRUITER:
            return isMessageForRecruiter ? 'Call ended by you' : 'Call ended by recruiter';
        case CALL_ENDED_BY.CANDIDATE:
            return isMessageForRecruiter ? 'Call ended by candidate' : 'Call ended by you';
        case CALL_ENDED_BY.BULL_MQ_JOB:
            return 'Call ended due to inactivity';
        case CALL_ENDED_BY.PROVIDER_WEBHOOK:
            return 'Call ended by provider';
        default:
            return 'Call ended';
    }
}