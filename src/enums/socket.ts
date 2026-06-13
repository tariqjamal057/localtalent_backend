export enum SOCKET_INCOMING_EVENT {

    CONNECTION = 'connection',
    DISCONNECT = 'disconnect',
    ERROR = 'error',

    GET_MATCH = 'get_match',
    STOP_MATCH = 'stop_match',
    REQUEST_PHONE_NUMBER = 'request_phone_number',
    REQUEST_PHONE_NUMBER_RESPONSE = 'request_phone_number_response',
    REQUEST_VIDEO = 'request_video',
    REQUEST_VIDEO_RESPONSE = 'request_video_response',
    DECLINE_CALL = 'decline_Call',
    REJECT_PROPOSAL = 'reject_proposal'
}

export enum SOCKET_OUTGOING_EVENT {
    ERROR = 'app_error',
    MATCH_FOUND = 'match_found',
    JOIN_CALL = 'join_call',
    INCOMING_CALL = 'incoming_call',
    CALL_ENDED = 'call_ended',
    CALL_END_RESULT = 'call_end_result',
    VIDEO_REQUEST = 'video_request',
    VIDEO_REQUEST_RESPONSE = 'video_request_response',
    ALL_ACCEPTED_PROPOSAL = 'all_accepted_proposal',
    REQUEST_PHONE_NUMBER_RESPONSE = 'request_phone_number_response',
    REQUEST_PHONE_NUMBER = 'request_phone_number',
    CALL_DECLINED = 'call_decliend',
    PROPOSAL_REJECTED = 'proposal_rejected'
}