export enum SOCKET_INCOMING_EVENT {

    CONNECTION = 'connection',
    DISCONNECT = 'disconnect',
    ERROR = 'error',

    GET_MATCH = 'get_match',
    STOP_MATCH = 'stop_match',
}

export enum SOCKET_OUTGOING_EVENT {
    ERROR = 'app_error',
    MATCH_FOUND = 'match_found',
    JOIN_CALL = 'join_call',
    INCOMING_CALL = 'incoming_call',
    CALL_ENDED = 'call_ended',
    CALL_END_RESULT = 'call_end_result',
    VIDEO_REQUEST = 'video_request',
    ALL_ACCEPTED_PROPOSAL = 'all_accepted_proposal'
}