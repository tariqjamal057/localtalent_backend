import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
}

const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
    corsOrigin: process.env.CORS_ORIGIN || '*',

    db: {
        url: requireEnv('DATABASE_URL'),
        poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
        poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
        idleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
        connectionTimeoutMs: parseInt(process.env.DB_CONN_TIMEOUT_MS || '5000', 10),
        statementTimeoutMs: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '30000', 10),
    },

    redis: {
        url: requireEnv('REDIS_URL'),
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'hl:',
        connectTimeoutMs: parseInt(process.env.REDIS_CONNECT_TIMEOUT_MS || '5000', 10),
        commandTimeoutMs: parseInt(process.env.REDIS_COMMAND_TIMEOUT_MS || '3000', 10),
        maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
    },

    queueRedis: {
        url: requireEnv('QUEUE_REDIS_URL'),
    },

    socket: {
        pingTimeoutMs: parseInt(process.env.SOCKET_PING_TIMEOUT_MS || '20000', 10),
        pingIntervalMs: parseInt(process.env.SOCKET_PING_INTERVAL_MS || '25000', 10),
        maxHttpBufferSize: parseInt(process.env.SOCKET_MAX_BUFFER_SIZE || '1000000', 10),
        transports: (process.env.SOCKET_TRANSPORTS || 'websocket,polling').split(',') as (
            | 'websocket'
            | 'polling'
        )[],
    },

    smsService: {
        serviceAvailable: process.env.SMS_SERVICE_AVAILIABLE === 'true',
        DEFAULT_TEST_OTP: '7777',
    },

    jwt: {
        accessSecret: requireEnv('JWT_ACCESS_SECRET'),
        refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    otp: {
        DEFAULT_TEST_OTP: '7777',
        OTP_EXPIRATION_MINUTES: parseInt(process.env.OTP_EXPIRATION_MINUTES || '5', 10),
    },

    payment: {
        TAX_RATE: parseFloat(requireEnv('TAX_PERCENTAGE')) / 100,
        RAZORPAY_KEY_ID: requireEnv('RAZORPAY_KEY_ID'),
        RAZORPAY_KEY_SECRET: requireEnv('RAZORPAY_KEY_SECRET'),
    },

    streamCall: {
        apiKey: requireEnv('STREAM_CALL_API_KEY'),
        apiSecret: requireEnv('STREAM_CALL_API_SECRET'),
        userTokenExpirationSeconds: parseInt(process.env.STREAM_CALL_USER_TOKEN_EXPIRATION_SECONDS || '900', 10),
        maximumCallDurationSeconds: parseInt(process.env.STREAM_CALL_MAXIMUM_CALL_DURATION_SECONDS || '600', 10),
        maximumRingingDurationSeconds: parseInt(process.env.STREAM_CALL_MAXIMUM_RINGING_DURATION_SECONDS || '60', 10),
        callEndBufferSeconds: parseInt(process.env.STREAM_CALL_END_BUFFER_SECONDS || '30', 10),
    },

    streamChat: {
        apiKey: requireEnv('STREAM_CHAT_API_KEY'),
        apiSecret: requireEnv('STREAM_CHAT_API_SECRET'),
    },

    matching: {
        PRIORITY_QUEUE_BATCH_SIZE: parseInt(process.env.MATCHING_BATCH_SIZE || '1', 10),
    },

    call: {
        USER_LOCK_TTL_SECONDS: parseInt(process.env.CALL_USER_LOCK_TTL_SECONDS || '30', 10),
    },

    i18n: {
        supportedLocales: requireEnv('SUPPORTED_LOCALES').split(',') as string[],
        cacheMaxAgeSeconds: parseInt(process.env.TRANSLATION_CACHE_MAX_AGE_SECONDS || '86400', 10),
    },
};

export default config;
