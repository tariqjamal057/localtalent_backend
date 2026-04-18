import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    statusCode: number;
    timestamp: string;
}

export class ApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T
): Response => {
    return res.status(statusCode).json({
        success: statusCode < 400,
        message,
        data,
        statusCode,
        timestamp: new Date().toISOString(),
    } as ApiResponse<T>);
};

export const sendError = (
    res: Response,
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR
): Response => {
    return res.status(statusCode).json({
        success: false,
        message,
        statusCode,
        timestamp: new Date().toISOString(),
    });
};
