import * as admin from 'firebase-admin';
import fs from 'fs';
import config from '../config';
import logger from '../utils/logger';
import { deviceTokenRepository, DeviceTokenRepository } from '../repositories/device-token.repository';

export interface PushNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

export class FcmService {
    private initialized = false;

    constructor(private readonly deviceTokenRepository: DeviceTokenRepository) { }

    private initialize(): void {
        if (this.initialized) return;
        if (admin.apps.length > 0) {
            this.initialized = true;
            return;
        }
        try {
            const serviceAccount: admin.ServiceAccount = JSON.parse(
                fs.readFileSync(config.firebase.serviceAccountPath, 'utf8')
            );
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            this.initialized = true;
            logger.info('[FcmService] Firebase Admin SDK initialised');
        } catch (error) {
            logger.error(`[FcmService] Failed to initialise Firebase Admin SDK: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async getTokensForUser(userId: bigint): Promise<string[]> {
        try {
            return await this.deviceTokenRepository.getTokensByUserId(userId);
        } catch (error) {
            logger.error(`[FcmService] Failed to fetch device tokens for user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }

    public async sendPushNotification(userId: bigint, payload: PushNotificationPayload): Promise<void> {
        this.initialize();
        if (!this.initialized) {
            logger.warn('[FcmService] Firebase not initialised, skipping push notification.');
            return;
        }

        const tokens = await this.getTokensForUser(userId);
        if (tokens.length === 0) {
            logger.debug(`[FcmService] No device tokens found for user ${userId}, skipping push.`);
            return;
        }

        try {
            const message: admin.messaging.MulticastMessage = {
                tokens,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data,
                android: { priority: 'high' },
            };
            const response = await admin.messaging().sendEachForMulticast(message);
            logger.info(`[FcmService] Push sent to user ${userId}: ${response.successCount} succeeded, ${response.failureCount} failed`);

            await this.cleanupInvalidTokens(tokens, response.responses);
        } catch (error) {
            logger.error(`[FcmService] Failed to send push to user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async cleanupInvalidTokens(tokens: string[], responses: admin.messaging.BatchResponse['responses']): Promise<void> {
        try {
            const invalidTokenDeletes = responses
                .map((resp, index) => ({ resp, token: tokens[index] }))
                .filter(({ resp }) => !resp.success)
                .filter(({ resp }) => {
                    const code = resp.error?.code;
                    return code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered';
                })
                .map(({ token }) => this.deviceTokenRepository.deleteByTokenValue(token));
            await Promise.all(invalidTokenDeletes);
        } catch (error) {
            logger.error(`[FcmService] Failed to clean up invalid tokens: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

export const fcmService = new FcmService(deviceTokenRepository);