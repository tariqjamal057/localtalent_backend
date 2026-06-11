import config from "../config";
import { StreamCallClient, StreamChatClient } from "../config/stream";
import { MESSAGES } from "../constants/messages";
import { STREAM_CALL_TYPE } from "../enums/call";
import { SESSION_TYPE } from "../enums/sessions";
import { UserDataToJoinCall } from "../types/call.type";
import { UserDataToJoinChat } from "../types/chat.type";
import logger from "./logger";

export class StreamUtil {
    private static streamChatClient = StreamChatClient.getInstance();
    private static streamCallClient = StreamCallClient.getInstance();

    private static getStreamUserId(userId: bigint): string {
        return `user_${userId}`;
    }

    private static getChatChannelId(userIds: bigint[]): string {
        const sortedIds = userIds.map(id => id.toString()).sort();
        return `channel_${sortedIds.join('_')}`;
    }

    private static getCallId(userIds: bigint[]): string {
        const sortedIds = userIds.map(id => id.toString()).sort();
        return `call_${sortedIds.join('_')}_${Date.now()}`;
    }

    private static async upsertUsersForChat(users: { id: bigint; name: string }[]): Promise<void> {
        const streamUsers = users.map(user => ({
            id: this.getStreamUserId(BigInt(user.id)),
            name: user.name,
            role: 'user',
        }));
        await this.streamChatClient.upsertUsers(streamUsers);
    }

    private static async createChatToken(userId: bigint): Promise<string> {
        const streamUserId = this.getStreamUserId(userId);
        return this.streamChatClient.createToken(streamUserId);
    }

    private static async createChatChannel(userIds: bigint[]): Promise<string> {
        const streamMemberIds = userIds.map(id => this.getStreamUserId(id));
        const channelId = this.getChatChannelId(userIds);
        const channel = this.streamChatClient.channel('messaging', channelId, {
            members: streamMemberIds,
            created_by_id: streamMemberIds[0]
        });
        await channel.create();
        if (!channel.id) {
            throw new Error(MESSAGES.STREAM.CHAT_CHANNEL_CREATION_FAILED);
        }
        return channel.id;
    }

    private static async upsertUsersForCall(users: { id: bigint; name: string }[]): Promise<void> {
        const streamUsers = users.map(user => ({
            id: this.getStreamUserId(BigInt(user.id)),
            name: user.name,
            role: 'user',
        }));
        await this.streamCallClient.upsertUsers(streamUsers);
    }

    private static async createCallToken(userId: bigint): Promise<string> {
        const streamUserId = this.getStreamUserId(userId);
        return this.streamCallClient.generateUserToken({ user_id: streamUserId, validity_in_seconds: config.streamCall.userTokenExpirationSeconds });
    }

    private static async createCall(userIds: bigint[], callType: STREAM_CALL_TYPE): Promise<string> {
        const callId = this.getCallId(userIds);
        const call = this.streamCallClient.video.call(callType, callId);
        await call.create(
            {
                ring: true,
                data: {
                    members: userIds.map(id => {
                        return {
                            user_id: this.getStreamUserId(id),
                            role: 'user'
                        }
                    }),
                    created_by_id: this.getStreamUserId(userIds[0]),
                    settings_override: {
                        audio: { mic_default_on: true, default_device: "speaker" },
                        // video: { camera_default_on: true, target_resolution: { width: 480, height: 360, bitrate: 600000 } },
                        ring: {
                            incoming_call_timeout_ms: config.streamCall.maximumRingingDurationSeconds * 1000,
                            auto_cancel_timeout_ms: config.streamCall.maximumRingingDurationSeconds * 1000,
                        },
                        limits: {
                            max_duration_seconds: config.streamCall.maximumCallDurationSeconds + config.streamCall.callEndBufferSeconds,
                        }
                    }
                }
            }
        );
        if (!call.id) {
            throw new Error(MESSAGES.STREAM.CALL_CREATION_FAILED);
        }
        return call.id;
    }

    public static async setupChatForUsers(users: { id: bigint; name: string }[]): Promise<UserDataToJoinChat[]> {
        try {
            await this.upsertUsersForChat(users);
            const userIds = users.map(user => user.id);
            const streamUserIds = users.map(user => this.getStreamUserId(user.id));
            const tokens = await Promise.all(users.map(user => this.createChatToken(user.id)));
            const channelId = await this.createChatChannel(userIds);
            return users.map((_, index) => ({
                userId: userIds[index],
                streamUserId: streamUserIds[index],
                token: tokens[index],
                channelId,
                sessionType: SESSION_TYPE.CHAT,
            }));
        } catch (error) {
            logger.info('Error occured during chat setup', { error })
            throw error;
        }
    }

    public static async setupCallForUsers(users: { id: bigint; name: string, canRequestVideoCall: boolean }[]): Promise<UserDataToJoinCall[]> {
        const callType = users.some(user => user.canRequestVideoCall) ? STREAM_CALL_TYPE.DEFAULT : STREAM_CALL_TYPE.AUDIO_CALL;
        await this.upsertUsersForCall(users);
        const userIds = users.map(user => user.id);
        const streamUserIds = users.map(user => this.getStreamUserId(user.id));
        const tokens = await Promise.all(users.map(user => this.createCallToken(user.id)));
        const callId = await this.createCall(userIds, callType);
        return users.map((_, index) => ({
            userId: userIds[index],
            streamUserId: streamUserIds[index],
            token: tokens[index],
            callId,
            sessionType: SESSION_TYPE.CALL,
            isVideoCallAllowed: callType === STREAM_CALL_TYPE.DEFAULT,
            maxCallDurationSeconds: config.streamCall.maximumCallDurationSeconds + config.streamCall.callEndBufferSeconds,
            canRequestVideoCall: users[index].canRequestVideoCall
        }));
    }

    public static async endCall(callId: string, callType: STREAM_CALL_TYPE): Promise<void> {
        const call = this.streamCallClient.video.call(callType, callId);
        await call.end();
    }

    public static async getChatTokenAndChannelId(userId: bigint, otherUserId: bigint) {
        try {
            const chanelId = this.getChatChannelId([userId, otherUserId]);
            const chatToken = await this.createChatToken(userId);
            const streamUserId = this.getStreamUserId(userId);
            return { chanelId, chatToken, streamUserId }
        } catch (error) {
            logger.info(`Error while creating chatToken ${error}`);
            throw error;
        }
    }
}