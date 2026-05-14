import { Pool, PoolClient, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import config from './index';
import logger from '../utils/logger';

export class DatabaseService {
    private static instance: DatabaseService;
    private pool: Pool | null = null;

    private constructor() { }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public getPool(): Pool {
        if (!this.pool) {
            throw new Error('DatabaseService: not connected — call connect() first.');
        }
        return this.pool;
    }

    public async connect(): Promise<void> {
        if (this.pool) return;

        const parsed = new URL(config.db.url);
        const sslMode = parsed.searchParams.get('sslmode');
        const requireSSL = sslMode === 'require' || sslMode === 'verify-full' || sslMode === 'prefer';
        parsed.searchParams.delete('sslmode');
        parsed.searchParams.delete('channel_binding');
        const cleanUrl = parsed.toString();

        const poolConfig: PoolConfig = {
            connectionString: cleanUrl,
            max: config.db.poolMax,
            min: config.db.poolMin,
            idleTimeoutMillis: config.db.idleTimeoutMs,
            connectionTimeoutMillis: config.db.connectionTimeoutMs,
            statement_timeout: config.db.statementTimeoutMs,
            ssl: requireSSL ? { rejectUnauthorized: true } : false,
            application_name: 'hyperlocal-backend',
        };

        this.pool = new Pool(poolConfig);

        this.pool.on('error', (err: Error) => {
            logger.error('Unexpected error on idle PostgreSQL client', err);
        });

        const client = await this.pool.connect();
        try {
            await client.query('SELECT 1');
            logger.info(`PostgreSQL connected`);
        } finally {
            client.release();
        }
    }

    public async disconnect(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            logger.info('PostgreSQL pool closed');
        }
    }

    public async query<T extends QueryResultRow = QueryResultRow>(
        text: string,
        params?: unknown[]
    ): Promise<QueryResult<T>> {
        const start = Date.now();
        const result = await this.getPool().query<T>(text, params);
        logger.debug(
            `PostgreSQL query in ${Date.now() - start}ms: ${text.substring(0, 80)}`
        );
        return result;
    }

    public async withTransaction<T>(
        callback: (client: PoolClient) => Promise<T>
    ): Promise<T> {
        const client = await this.getPool().connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}

export default DatabaseService.getInstance();
