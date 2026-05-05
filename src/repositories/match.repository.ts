import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { Match, MatchRow, CreateMatchDto, UpdateMatchDto } from '../types/match.types';

export type { Match, CreateMatchDto, UpdateMatchDto };

function matchRowToDto(row: MatchRow): Match {
    return {
        id: row.id,
        recruiterUserId: row.recruiter_user_id,
        candidateUserId: row.candidate_user_id,
        recruiterFormData: row.recruiter_form_data,
        candidateFormData: row.candidate_form_data,
        finalState: row.final_state,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        totalUsers: row.total_users,
        proposalAcceptedCount: row.proposal_accepted_count,
        providerCallId: row.provider_call_id
    };
}

export class MatchRepository {
    constructor(private readonly db: DatabaseService) { }

    async create(dto: CreateMatchDto): Promise<Match> {
        const query = `
            INSERT INTO matches (recruiter_user_id, candidate_user_id, recruiter_form_data, candidate_form_data, final_state, total_users)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            dto.recruiterUserId,
            dto.candidateUserId,
            dto.recruiterFormData ? JSON.stringify(dto.recruiterFormData) : null,
            dto.candidateFormData ? JSON.stringify(dto.candidateFormData) : null,
            dto.finalState,
            dto.totalUsers
        ];
        const result: QueryResult<MatchRow> = await this.db.query(query, values);
        return matchRowToDto(result.rows[0]);
    }

    async getById(matchId: bigint): Promise<Match | null> {
        const query = `
            SELECT *
            FROM matches
            WHERE id = $1
        `;
        const result: QueryResult<MatchRow> = await this.db.query(query, [matchId]);
        if (result.rows.length === 0) return null;
        return matchRowToDto(result.rows[0]);
    }

    async getByTwoUsers(userAId: bigint, userBId: bigint, finalState: number): Promise<Match[]> {
        const query = `
            SELECT *
            FROM matches
            WHERE (recruiter_user_id = $1 AND candidate_user_id = $2)
               OR (recruiter_user_id = $2 AND candidate_user_id = $1)
              AND final_state = $3
            ORDER BY created_at DESC
        `;
        const result: QueryResult<MatchRow> = await this.db.query(query, [userAId, userBId, finalState]);
        return result.rows.map(matchRowToDto);
    }

    async getByUserIdAndFinalState(userId: bigint, finalState: number): Promise<Match[]> {
        const query = `
            SELECT *
            FROM matches
            WHERE (recruiter_user_id = $1 OR candidate_user_id = $1)
              AND final_state = $2
            ORDER BY created_at DESC
        `;
        const result: QueryResult<MatchRow> = await this.db.query(query, [userId, finalState]);
        return result.rows.map(matchRowToDto);
    }

    async updateFinalState(matchId: bigint, finalState: number): Promise<Match | null> {
        const query = `
            UPDATE matches
            SET final_state = $1
            WHERE id = $2
            RETURNING *
        `;
        const result: QueryResult<MatchRow> = await this.db.query(query, [finalState, matchId]);
        if (result.rows.length === 0) return null;
        return matchRowToDto(result.rows[0]);
    }

    async update(matchId: bigint, dto: UpdateMatchDto): Promise<Match | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let idx = 1;

        if (dto.provider_call_id !== undefined) {
            fields.push(`provider_call_id = $${idx++}`);
            values.push(dto.provider_call_id);
        }
        if (dto.total_users !== undefined) {
            fields.push(`total_users = $${idx++}`);
            values.push(dto.total_users);
        }
        if (dto.proposal_accepted_count !== undefined) {
            fields.push(`proposal_accepted_count = $${idx++}`);
            values.push(dto.proposal_accepted_count);
        }

        if (dto.finalState !== undefined) {
            fields.push(`final_state = $${idx++}`);
            values.push(dto.finalState);
        }

        if (fields.length === 0) return this.getById(matchId);

        values.push(matchId);
        const query = `
            UPDATE matches
            SET ${fields.join(', ')}
            WHERE id = $${idx}
        `;
        const result: QueryResult<MatchRow> = await this.db.query(query, values);
        if (result.rows.length === 0) return null;
        return matchRowToDto(result.rows[0]);
    }
}

export const matchRepository = new MatchRepository(DatabaseService.getInstance());
