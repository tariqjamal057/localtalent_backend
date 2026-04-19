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
    },

    jwt: {
        accessSecret: requireEnv('JWT_ACCESS_SECRET'),
        refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
};

export default config;
