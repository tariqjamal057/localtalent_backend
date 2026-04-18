import { Request, Response, NextFunction } from 'express';
import { Schema, ValidationError } from 'joi';
import { StatusCodes } from 'http-status-codes';

export interface ValidatedRequest extends Request {
    validated?: Record<string, unknown>;
}

const validate =
    (schema: Schema, source: 'body' | 'query' | 'params' = 'body') =>
        (req: ValidatedRequest, res: Response, next: NextFunction): void => {
            const { error, value } = schema.validate(req[source], {
                abortEarly: false,
                stripUnknown: true,
            });

            if (error) {
                const messages = error.details.map((detail: ValidationError['details'][0]) => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                }));

                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'Validation error',
                    errors: messages,
                    timestamp: new Date().toISOString(),
                });
                return;
            }

            req.validated = value;
            next();
        };

export default validate;
