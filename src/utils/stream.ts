import config from "../config";
import { StreamCallClient, StreamChatClient } from "../config/stream";
import { MESSAGES } from "../constants/messages";
import { CALL_TYPE } from "../enums/call";
import { SESSION_TYPE } from "../enums/sessions";
import { UserDataToJoinCall } from "../types/call.type";

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

    private static async createCall(userIds: bigint[], callType: CALL_TYPE): Promise<string> {
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
                    settings_override: {
                        audio: { mic_default_on: true, default_device: "speaker" },
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

    public static async setupChatForUsers(users: { id: bigint; name: string }[]): Promise<{
        userId: bigint;
        streamUserId: string;
        token: string;
        channelId: string;
        sessionType: SESSION_TYPE;
    }[]> {
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
    }

    public static async setupCallForUsers(users: { id: bigint; name: string }[], callType: CALL_TYPE = CALL_TYPE.AUDIO_CALL): Promise<UserDataToJoinCall[]> {
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
            isVideoCallAllowed: callType === CALL_TYPE.DEFAULT,
            maxCallDurationSeconds: config.streamCall.maximumCallDurationSeconds + config.streamCall.callEndBufferSeconds,
        }));
    }
}