import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/response';
import { MESSAGES } from '../constants/messages';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: bigint;
            };
        }
    }
}

const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(MESSAGES.AUTH.ACCESS_TOKEN_REQUIRED, StatusCodes.UNAUTHORIZED);
    }

    const token = authHeader.slice(7);

    const decoded = verifyAccessToken(token);
    req.user = { id: BigInt(decoded.userId) };
    next();
};

export default authenticate;
