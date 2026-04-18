import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger';

interface CustomError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

const errorHandler: ErrorRequestHandler = (
    err: CustomError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Internal Server Error';

    logger.error(`[${statusCode}] ${message}`, {
        error: err,
        stack: err.stack,
    });

    res.status(statusCode).json({
        success: false,
        message,
        statusCode,
        timestamp: new Date().toISOString(),
    });
};

export default errorHandler;
