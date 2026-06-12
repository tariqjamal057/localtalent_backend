import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { s3Service, S3Service } from '../services/s3.service';
import { sendResponse } from '../utils/response';
import { MESSAGES } from '../constants/messages';

export class UploadController {
    constructor(private readonly s3Service: S3Service) { }

    getPresignedUrl = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const { fileName, contentType, folder } = req.query as {
            fileName: string;
            contentType: string;
            folder: string;
        };
        const result = await this.s3Service.getPresignedUploadUrl(folder, fileName, contentType);
        sendResponse(res, StatusCodes.OK, MESSAGES.UPLOAD.PRESIGNED_URL_GENERATED, result);
    };
}

export const uploadController = new UploadController(s3Service);
