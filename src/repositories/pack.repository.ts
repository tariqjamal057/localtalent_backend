import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { AdPack, AdPackRow, MatchCountPack, MatchCountPackRow } from '../types/pack.types';
import { adPackRowToDto, matchCountPackRowToDto } from '../utils/mappers/pack.mapper';

export type { MatchCountPack, AdPack };

export class PackRepository {
    constructor(private readonly db: DatabaseService) { }

    async getMatchCountPacks(onlyActive = true): Promise<MatchCountPack[]> {
        const query = `
            SELECT *
            FROM match_count_packs
            WHERE ($1 = FALSE OR is_active = TRUE)
            ORDER BY priority ASC
        `;
        const result: QueryResult<MatchCountPackRow> = await this.db.query(query, [onlyActive]);
        return result.rows.map(row => matchCountPackRowToDto(row));
    }

    async getAdPacks(onlyActive = true): Promise<AdPack[]> {
        const query = `
            SELECT *
            FROM ad_packs
            WHERE ($1 = FALSE OR is_active = TRUE)
            ORDER BY priority ASC
        `;
        const result: QueryResult<AdPackRow> = await this.db.query(query, [onlyActive]);
        return result.rows.map(row => adPackRowToDto(row));
    }

    async getMatchCountPackById(id: bigint): Promise<MatchCountPack | null> {
        const query = `
            SELECT *
            FROM match_count_packs
            WHERE id = $1
        `;
        const result: QueryResult<MatchCountPackRow> = await this.db.query(query, [id]);
        if (result.rows.length === 0) return null;
        return matchCountPackRowToDto(result.rows[0]);
    }

    async getAdPackById(id: bigint): Promise<AdPack | null> {
        const query = `
            SELECT *
            FROM ad_packs
            WHERE id = $1
        `;
        const result: QueryResult<AdPackRow> = await this.db.query(query, [id]);
        if (result.rows.length === 0) return null;
        return adPackRowToDto(result.rows[0]);
    }
}

export const packRepository = new PackRepository(DatabaseService.getInstance());
