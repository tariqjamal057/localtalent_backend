import { StreamClient } from '@stream-io/node-sdk';
import { StreamChat } from 'stream-chat';
import config from './index';

export class StreamCallClient {
    private static instance: StreamClient;

    private constructor() { }

    static getInstance(): StreamClient {
        if (!StreamCallClient.instance) {
            StreamCallClient.instance = new StreamClient(
                config.streamCall.apiKey,
                config.streamCall.apiSecret,
            );
        }
        return StreamCallClient.instance;
    }
}

export class StreamChatClient {
    private static instance: StreamChat;

    private constructor() { }

    static getInstance(): StreamChat {
        if (!StreamChatClient.instance) {
            StreamChatClient.instance = StreamChat.getInstance(
                config.streamChat.apiKey,
                config.streamChat.apiSecret,
            );
        }
        return StreamChatClient.instance;
    }
}
