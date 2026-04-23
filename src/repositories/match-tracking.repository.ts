import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { MatchTracking, MatchTrackingRow, CreateMatchTrackingDto } from '../types/match-tracking.types';

export type { MatchTracking, CreateMatchTrackingDto };

function matchTrackingRowToDto(row: MatchTrackingRow): MatchTracking {
    return {
        id: row.id,
        matchId: row.match_id,
        state: row.state,
        createdAt: row.created_at,
    };
}

export class MatchTrackingRepository {
    constructor(private readonly db: DatabaseService) { }

    async create(dto: CreateMatchTrackingDto): Promise<MatchTracking> {
        const query = `
            INSERT INTO match_tracking (match_id, state)
            VALUES ($1, $2)
            RETURNING *
        `;
        const result: QueryResult<MatchTrackingRow> = await this.db.query(query, [dto.matchId, dto.state]);
        return matchTrackingRowToDto(result.rows[0]);
    }
}

export const matchTrackingRepository = new MatchTrackingRepository(DatabaseService.getInstance());
