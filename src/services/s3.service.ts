import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import config from '../config';
import logger from '../utils/logger';

const s3Client = new S3Client({
    region: config.s3.region,
    credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
    },
});

export interface PresignedUploadResult {
    uploadUrl: string;
    fileKey: string;
    expiresInSeconds: number;
}

export class S3Service {
    async getPresignedUploadUrl(
        folder: string,
        fileName: string,
        contentType: string,
    ): Promise<PresignedUploadResult> {
        try {
            const ext = fileName.includes('.') ? fileName.split('.').pop() : '';
            const fileKey = `${folder}/${randomUUID()}${ext ? `.${ext}` : ''}`;

            const command = new PutObjectCommand({
                Bucket: config.s3.bucketName,
                Key: fileKey,
                ContentType: contentType,
            });

            const uploadUrl = await getSignedUrl(s3Client, command, {
                expiresIn: config.s3.presignedUrlExpiresInSeconds,
            });

            return {
                uploadUrl,
                fileKey,
                expiresInSeconds: config.s3.presignedUrlExpiresInSeconds,
            };
        } catch (error) {
            logger.info(`[S3Service] error while getting presigned url erro ${error}`);
            throw error;
        }
    }
}

export const s3Service = new S3Service();
