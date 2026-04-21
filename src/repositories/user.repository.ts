import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { User, UserRow, CreateUserDto, UpdateUserDto } from '../types/user.types';
import { userRowToDto } from '../utils/mappers/user.mapper';
import { DEFAULT_LANGUAGE } from '../enums/language';

export type { User, CreateUserDto, UpdateUserDto };

export class UserRepository {
    constructor(private readonly db: DatabaseService) { }

    async getById(id: bigint): Promise<User | null> {
        const query = `
            SELECT *
            FROM users
            WHERE id = $1
        `;
        const result: QueryResult<UserRow> = await this.db.query(query, [id]);
        if (result.rows.length === 0) return null;
        return userRowToDto(result.rows[0]);
    }

    async getByMobileNumber(mobileNumber: string, countryCode: string): Promise<User | null> {
        const query = `
            SELECT *
            FROM users
            WHERE mobile_number = $1
              AND country_code = $2
        `;
        const result: QueryResult<UserRow> = await this.db.query(query, [mobileNumber, countryCode]);
        if (result.rows.length === 0) return null;
        return userRowToDto(result.rows[0]);
    }

    async upsert(dto: CreateUserDto): Promise<User> {
        const query = `
            INSERT INTO users (mobile_number, country_code, user_type, app_language_code)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (mobile_number)
            DO UPDATE SET app_language_code = EXCLUDED.app_language_code
            RETURNING *
        `;
        const values = [
            dto.mobileNumber,
            dto.countryCode,
            dto.userType,
            dto.appLanguageCode ?? DEFAULT_LANGUAGE,
        ];
        const result: QueryResult<UserRow> = await this.db.query(query, values);
        return userRowToDto(result.rows[0]);
    }

    async update(id: bigint, dto: UpdateUserDto): Promise<void> {
        const query = `
            UPDATE users
            SET app_language_code = $1,
                updated_at = NOW()
            WHERE id = $2
        `;
        await this.db.query(query, [dto.appLanguageCode, id]);
    }
}

export const userRepository = new UserRepository(DatabaseService.getInstance());
