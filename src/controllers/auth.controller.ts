import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyRefreshToken, signAccessToken } from '../utils/jwt';
import { sendResponse, ApiError } from '../utils/response';
import { MESSAGES } from '../constants/messages';
import { userProfileRepository } from '../repositories/user-profile.repository';

export class AuthController {
    refreshToken = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const { refreshToken } = req.body as { refreshToken: string };

        try {
            const decoded = verifyRefreshToken(refreshToken);
            const accessToken = signAccessToken({ userId: decoded.userId });
            const [user, userProfile] = await Promise.all([
                // userrepo.getById(BigInt(decoded.userId)),
                {},
                userProfileRepository.getByUserId(BigInt(decoded.userId))
            ]);
            if (!user || !userProfile) throw new ApiError(MESSAGES.AUTH.INVALID_REFRESH_TOKEN, StatusCodes.UNAUTHORIZED);
            sendResponse(res, StatusCodes.OK, MESSAGES.AUTH.TOKEN_REFRESHED, { accessToken, userProfile });
        } catch {
            throw new ApiError(MESSAGES.AUTH.INVALID_REFRESH_TOKEN, StatusCodes.UNAUTHORIZED);
        }
    };
}

export const authController = new AuthController();
