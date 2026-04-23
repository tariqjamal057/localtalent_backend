import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import {
    Promocode,
    PromocodeRow,
    CreatePromocodeDto,
    UpdatePromocodeDto,
} from '../types/promocode.types';
import { promocodeRowToDto } from '../utils/mappers/promocode.mapper';

export type { Promocode, CreatePromocodeDto, UpdatePromocodeDto };

export class PromocodeRepository {
    constructor(private readonly db: DatabaseService) { }

    async getById(id: bigint): Promise<Promocode | null> {
        const query = `
            SELECT *
            FROM promocodes
            WHERE id = $1
        `;
        const result: QueryResult<PromocodeRow> = await this.db.query(query, [id]);
        if (result.rows.length === 0) return null;
        return promocodeRowToDto(result.rows[0]);
    }

    async getByCode(code: string): Promise<Promocode | null> {
        const query = `
            SELECT *
            FROM promocodes
            WHERE code = $1
        `;
        const result: QueryResult<PromocodeRow> = await this.db.query(query, [code]);
        if (result.rows.length === 0) return null;
        return promocodeRowToDto(result.rows[0]);
    }

    async create(dto: CreatePromocodeDto): Promise<Promocode> {
        const query = `
            INSERT INTO promocodes (code, promo_type, multiplier, is_active, expires_on, is_referral_code)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            dto.code,
            dto.promoType,
            dto.multiplier ?? null,
            dto.isActive ?? true,
            dto.expiresOn ?? null,
            dto.isReferralCode ?? false,
        ];
        const result: QueryResult<PromocodeRow> = await this.db.query(query, values);
        return promocodeRowToDto(result.rows[0]);
    }

    async update(id: bigint, dto: UpdatePromocodeDto): Promise<void> {
        const query = `
            UPDATE promocodes
            SET is_active = COALESCE($1, is_active),
                multiplier = COALESCE($2, multiplier),
                expires_on = COALESCE($3, expires_on),
                updated_at = NOW()
            WHERE id = $4
        `;
        await this.db.query(query, [
            dto.isActive ?? null,
            dto.multiplier ?? null,
            dto.expiresOn ?? null,
            id,
        ]);
    }
}

export const promocodeRepository = new PromocodeRepository(DatabaseService.getInstance());
