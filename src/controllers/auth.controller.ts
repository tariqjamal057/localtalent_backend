import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '../utils/jwt';
import { sendResponse, ApiError, sendError } from '../utils/response';
import { MESSAGES } from '../constants/messages';
import { userProfileRepository } from '../repositories/user-profile.repository';
import { userRepository } from '../repositories/user.repository';
import { userWalletRepository } from '../repositories/user-wallet.repository';
import { redisOtpService } from '../services/redis/redis-otp.service';
import config from '../config';
import { Otp } from '../utils/otp';
import { USER_TYPE } from '../enums/user';
import logger from '../utils/logger';


export class AuthController {
    refreshToken = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const { refreshToken } = req.body as { refreshToken: string };
        try {
            const decoded = verifyRefreshToken(refreshToken);
            logger.info(`Refresh token verified for userId: ${decoded.userId}`);
            const user = await userRepository.getById(BigInt(decoded.userId));
            if (!user || !user?.isActive) throw new ApiError(MESSAGES.AUTH.INVALID_REFRESH_TOKEN, StatusCodes.UNAUTHORIZED);
            if (user.refreshToken !== refreshToken) throw new ApiError(MESSAGES.AUTH.SESSION_EXPIRED, StatusCodes.UNAUTHORIZED);
            const accessToken = signAccessToken({ userId: decoded.userId });
            const userProfile = await userProfileRepository.getByUserId(BigInt(decoded.userId));
            sendResponse(res, StatusCodes.OK, MESSAGES.AUTH.TOKEN_REFRESHED, { accessToken, userProfile, appLanguageCode: user.appLanguageCode });
        } catch (error) {
            logger.error('Error refreshing token', { error });
            throw new ApiError(MESSAGES.AUTH.INVALID_REFRESH_TOKEN, StatusCodes.UNAUTHORIZED);
        }
    };

    generateOtp = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const { countryCode, phoneNumber } = req.body;
        let otpToSend;
        const existingOtp = await redisOtpService.getOtp(countryCode, phoneNumber);
        if (existingOtp) {
            otpToSend = existingOtp;
        } else {
            otpToSend = Otp.generateOTP();
            await redisOtpService.setOtp(countryCode, phoneNumber, otpToSend, config.otp.OTP_EXPIRATION_MINUTES * 60);
        }
        await Otp.sendOTP(countryCode + phoneNumber, otpToSend);
        sendResponse(res, StatusCodes.OK, MESSAGES.AUTH.OTP_SENT);
    };

    verifyOtp = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const { countryCode, phoneNumber, otp, appLanguageCode, fullName } = req.body;
        const existingOtp = await redisOtpService.getOtp(countryCode, phoneNumber);
        if (existingOtp !== otp) {
            sendError(res, MESSAGES.AUTH.INVALID_OTP, StatusCodes.BAD_REQUEST);
            return;
        }
        redisOtpService.deleteOtp(countryCode, phoneNumber);
        const { user, isNewUser } = await userRepository.upsert({
            countryCode,
            mobileNumber: phoneNumber,
            userType: USER_TYPE.INDIVIDUAL,
            appLanguageCode
        });
        if (user.refreshToken) {
            try {
                verifyRefreshToken(user.refreshToken);
                sendError(res, MESSAGES.AUTH.ALREADY_LOGGED_IN, StatusCodes.FORBIDDEN);
                return;
            } catch {
                await userRepository.clearRefreshToken(user.id);
            }
        }
        if (isNewUser) {
            if (fullName) {
                await userProfileRepository.create(user.id, { fullName })
            }
            userWalletRepository.insert(user.id);
        }
        const refreshToken = signRefreshToken({ userId: user.id.toString() });
        const accessToken = signAccessToken({ userId: user.id.toString() });
        await userRepository.updateRefreshToken(user.id, refreshToken);
        const userProfile = await userProfileRepository.getByUserId(user.id);
        sendResponse(res, StatusCodes.OK, MESSAGES.AUTH.OTP_VERIFIED, { accessToken, refreshToken, userProfile, appLanguageCode: user.appLanguageCode, isNewUser });
    };

    logout = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) throw new ApiError(MESSAGES.AUTH.ACCESS_TOKEN_REQUIRED, StatusCodes.UNAUTHORIZED);
        await userRepository.clearRefreshToken(userId);
        sendResponse(res, StatusCodes.OK, MESSAGES.AUTH.LOGGED_OUT);
    };
}

export const authController = new AuthController();
