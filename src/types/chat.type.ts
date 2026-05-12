import { SESSION_TYPE } from "../enums/sessions";

export interface UserDataToJoinChat {
    userId: bigint;
    streamUserId: string;
    token: string;
    channelId: string;
    sessionType: SESSION_TYPE;
}
