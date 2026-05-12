import crypto from "crypto";
import config from "../config";
import logger from "./logger";

const isSmsServiceAvailable = config.smsService.serviceAvailable;

export class Otp {
    static generateOTP = (): string => {
        if (!isSmsServiceAvailable) {
            return config.smsService.DEFAULT_TEST_OTP;
        }
        return crypto.randomInt(1000, 10000).toString();
    };
    static sendOTP = async (phoneNumber: string, otp: string): Promise<void> => {
        try {
            if (!isSmsServiceAvailable) {
                logger.info(`[SendOTP] SMS service is not available. OTP for ${phoneNumber} is ${otp}`);
                return;
            }
            logger.info(`[SendOTP] Sending OTP ${otp} to phone number ${phoneNumber}`);
        } catch (error) {
            logger.error(`[SendOTP] Failed to send OTP to phone number ${phoneNumber}: ${error}`);
        }
    };
}