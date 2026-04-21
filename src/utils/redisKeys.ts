const RedisKeys = {
    phoneNumberOtp: (countryCode: string, phoneNumber: string) => `user:${countryCode + phoneNumber}:otp`
};

export default RedisKeys;
