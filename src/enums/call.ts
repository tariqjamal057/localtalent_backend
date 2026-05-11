export enum CALL_TYPE {
    AUDIO_CALL = 'audio_room',
    DEFAULT = 'default',
}

export enum CALL_ENDED_BY {
    RECRUITER = 1,
    CANDIDATE = 2,
    BULL_MQ_JOB = 3,
    PROVIDER_WEBHOOK = 4
}

export enum PROPOSAL_STATE {
    NO_ONE_ACCEPTED = 1,
    ACCEPTED_BY_RECRUITER = 2,
    ACCEPTED_BY_CANDIDATE = 3,
    ACCEPTED_BY_BOTH = 4
}