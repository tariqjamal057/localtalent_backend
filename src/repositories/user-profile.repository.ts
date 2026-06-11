import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { UserProfile, UserProfileRow, CreateUserProfileDto, UpdateUserProfileDto } from '../types/user-profile.types';
import { userProfileRowToDto } from '../utils/mappers/user-profile.mapper';

export type { UserProfile, CreateUserProfileDto, UpdateUserProfileDto };

export class UserProfileRepository {
    constructor(private readonly db: DatabaseService) { }

    async getByUserId(userId: bigint): Promise<UserProfile | null> {
        const query = `
            SELECT *
            FROM user_profiles
            WHERE user_id = $1
        `;
        const result: QueryResult<UserProfileRow> = await this.db.query(query, [userId]);
        if (result.rows.length === 0) return null;
        return userProfileRowToDto(result.rows[0]);
    }

    async create(userId: bigint, dto: CreateUserProfileDto): Promise<UserProfile> {
        const query = `
            INSERT INTO user_profiles (
                user_id, full_name, gender, age, experience_level, price_per_day,
                location_name, latitude, longitude, spoken_languages, profile_image_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;
        const values = [
            userId,
            dto.fullName ?? null,
            dto.gender ?? null,
            dto.age ?? null,
            dto.experienceLevel ?? null,
            dto.pricePerDay ?? null,
            dto.locationName ?? null,
            dto.latitude ?? null,
            dto.longitude ?? null,
            dto.spokenLanguages ? JSON.stringify(dto.spokenLanguages) : null,
            dto.profileImageUrl ?? null,
        ];
        const result: QueryResult<UserProfileRow> = await this.db.query(query, values);
        return userProfileRowToDto(result.rows[0]);
    }

    async update(userId: bigint, dto: UpdateUserProfileDto): Promise<UserProfile | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let idx = 1;

        if (dto.fullName !== undefined) { fields.push(`full_name = $${idx++}`); values.push(dto.fullName); }
        if (dto.gender !== undefined) { fields.push(`gender = $${idx++}`); values.push(dto.gender); }
        if (dto.age !== undefined) { fields.push(`age = $${idx++}`); values.push(dto.age); }
        if (dto.experienceLevel !== undefined) { fields.push(`experience_level = $${idx++}`); values.push(dto.experienceLevel); }
        if (dto.pricePerDay !== undefined) { fields.push(`price_per_day = $${idx++}`); values.push(dto.pricePerDay); }
        if (dto.locationName !== undefined) { fields.push(`location_name = $${idx++}`); values.push(dto.locationName); }
        if (dto.latitude !== undefined) { fields.push(`latitude = $${idx++}`); values.push(dto.latitude); }
        if (dto.longitude !== undefined) { fields.push(`longitude = $${idx++}`); values.push(dto.longitude); }
        if (dto.spokenLanguages !== undefined) { fields.push(`spoken_languages = $${idx++}`); values.push(dto.spokenLanguages ? JSON.stringify(dto.spokenLanguages) : null); }
        if (dto.profileImageUrl !== undefined) { fields.push(`profile_image_url = $${idx++}`); values.push(dto.profileImageUrl); }
        if (dto.averageRating !== undefined) { fields.push(`average_rating = $${idx++}`); values.push(dto.averageRating); }

        if (fields.length === 0) return this.getByUserId(userId);

        fields.push(`updated_at = NOW()`);
        values.push(userId);

        const query = `
            UPDATE user_profiles
            SET ${fields.join(', ')}
            WHERE user_id = $${idx}
            RETURNING *
        `;
        const result: QueryResult<UserProfileRow> = await this.db.query(query, values);
        if (result.rows.length === 0) return null;
        return userProfileRowToDto(result.rows[0]);
    }
}

export const userProfileRepository = new UserProfileRepository(DatabaseService.getInstance());
