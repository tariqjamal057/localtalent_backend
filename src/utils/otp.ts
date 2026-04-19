import crypto from "crypto";
import config from "../config";
import logger from "./logger";

const isSmsServiceAvailable = config.smsService.serviceAvailable;

export const generateOTP = (): string => {
    return crypto.randomInt(1000, 10000).toString();
}

export const sendOTP = async (phoneNumber: string, otp: string): Promise<void> => {
    try {
        if (!isSmsServiceAvailable) {
            logger.info(`[SendOTP] SMS service is not available. OTP for ${phoneNumber} is ${otp}`);
            return;
        }
        logger.info(`[SendOTP] Sending OTP ${otp} to phone number ${phoneNumber}`);
    } catch (error) {
        logger.error(`[SendOTP] Failed to send OTP to phone number ${phoneNumber}: ${error}`);
    }
}