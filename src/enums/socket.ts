export enum SOCKET_INCOMING_EVENT {

    CONNECTION = 'connection',
    DISCONNECT = 'disconnect',
    ERROR = 'error',

    GET_MATCH = 'get_match',
}

export enum SOCKET_OUTGOING_EVENT {
    ERROR = 'error',
    MATCH_FOUND = 'match_found',
    JOIN_CALL = 'join_call',
    INCOMING_CALL = 'incoming_call',
}