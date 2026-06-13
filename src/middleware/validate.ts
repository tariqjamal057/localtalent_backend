import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger';

export enum VALIDATION_SOURCE {
    BODY = 'body',
    QUERY = 'query',
    PARAMS = 'params',
}

const validate =
    (schema: any, source: VALIDATION_SOURCE) =>
        (req: Request, res: Response, next: NextFunction): void => {
            const result = schema.safeParse(req[source]);

            if (!result.success) {
                const messages = result.error.issues.map((e: ZodError['issues'][number]) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                logger.info(`Messages ${JSON.stringify(messages)}`)
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'Validation error',
                    errors: messages,
                    timestamp: new Date().toISOString(),
                });
                return;
            }

            req[source] = result.data;
            next();
        };

export default validate;
