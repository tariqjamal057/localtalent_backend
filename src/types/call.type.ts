import { SESSION_TYPE } from "../enums/sessions";

export interface UserDataToJoinCall {
    userId: bigint;
    streamUserId: string;
    token: string;
    callId: string;
    sessionType: SESSION_TYPE;
    isVideoCallAllowed: boolean;
    maxCallDurationSeconds: number;
    canRequestVideoCall: boolean;
}