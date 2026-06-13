import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import config from '../config';
import { Match, MatchRow, CreateMatchDto, UpdateMatchDto, AcceptedMatchRow, PaginatedAcceptedMatches, PendingReviewMatchRow, PendingReviewMatch } from '../types/match.types';

export type { Match, CreateMatchDto, UpdateMatchDto, PaginatedAcceptedMatches, PendingReviewMatch };

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
        providerCallId: row.provider_call_id,
        callEndedBy: row.call_ended_by,
        callType: row.call_type,
        recruiterReviewId: row.recruiter_review_id,
        candidateReviewId: row.candidate_review_id,
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

        if (dto.proposalAcceptedCount !== undefined) {
            fields.push(`provider_call_id = $${idx++}`);
            values.push(dto.proposalAcceptedCount);
        }
        if (dto.totalUsers !== undefined) {
            fields.push(`total_users = $${idx++}`);
            values.push(dto.totalUsers);
        }

        if (dto.finalState !== undefined) {
            fields.push(`final_state = $${idx++}`);
            values.push(dto.finalState);
        }
        if (dto.callEndedBy !== undefined) {
            fields.push(`call_ended_by = $${idx++}`);
            values.push(dto.callEndedBy);
        }
        if (dto.callType !== undefined) {
            fields.push(`call_type = $${idx++}`);
            values.push(dto.callType);
        }
        if (dto.proposalAcceptedCount !== undefined) {
            fields.push(`proposal_accepted_count = $${idx++}`);
            values.push(dto.proposalAcceptedCount);
        }
        if (dto.recruiterReviewId !== undefined) {
            fields.push(`recruiter_review_id = $${idx++}`);
            values.push(dto.recruiterReviewId);
        }
        if (dto.candidateReviewId !== undefined) {
            fields.push(`candidate_review_id = $${idx++}`);
            values.push(dto.candidateReviewId);
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

    async getAcceptedProposalsOfUser(userId: bigint): Promise<Match[]> {
        const query = `
            SELECT *
            FROM matches
            WHERE (recruiter_user_id = $1 OR candidate_user_id = $1)
              AND totalUsers = proposalAcceptedCount
            ORDER BY created_at DESC
        `;
        const result: QueryResult<MatchRow> = await this.db.query(query, [userId]);
        return result.rows.map(matchRowToDto);
    }

    async getAcceptedMatchesPaginated(userId: bigint, page: number, limit: number): Promise<PaginatedAcceptedMatches> {
        const offset = (page - 1) * limit;
        const query = `
            SELECT
                m.id,
                m.recruiter_user_id,
                m.candidate_user_id,
                m.final_state,
                m.created_at,
                m.updated_at,
                up.full_name          AS other_user_full_name,
                up.profile_image_url  AS other_user_profile_image_url,
                COUNT(*) OVER()       AS total_count,
                CASE WHEN m.recruiter_user_id = $1
                    THEN (m.recruiter_form_data->>'latitude')
                    ELSE (m.candidate_form_data->>'latitude')
                END AS user_latitude,
                CASE WHEN m.recruiter_user_id = $1
                    THEN (m.recruiter_form_data->>'longitude')
                    ELSE (m.candidate_form_data->>'longitude')
                END AS user_longitude,
                CASE WHEN m.recruiter_user_id = $1
                    THEN (m.candidate_form_data->>'latitude')
                    ELSE (m.recruiter_form_data->>'latitude')
                END AS other_user_latitude,
                CASE WHEN m.recruiter_user_id = $1
                    THEN (m.candidate_form_data->>'longitude')
                    ELSE (m.recruiter_form_data->>'longitude')
                END AS other_user_longitude
            FROM matches m
            JOIN user_profiles up ON up.user_id = CASE
                WHEN m.recruiter_user_id = $1 THEN m.candidate_user_id
                ELSE m.recruiter_user_id
            END
            WHERE (m.recruiter_user_id = $1 OR m.candidate_user_id = $1)
              AND m.total_users = m.proposal_accepted_count
            ORDER BY m.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result: QueryResult<AcceptedMatchRow> = await this.db.query(query, [userId, limit, offset]);
        const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;
        return {
            data: result.rows.map(row => {
                const userLat = row.user_latitude != null ? parseFloat(row.user_latitude) : null;
                const userLng = row.user_longitude != null ? parseFloat(row.user_longitude) : null;
                const otherLat = row.other_user_latitude != null ? parseFloat(row.other_user_latitude) : null;
                const otherLng = row.other_user_longitude != null ? parseFloat(row.other_user_longitude) : null;
                return {
                    matchId: row.id,
                    otherUserId: row.recruiter_user_id == userId ? row.candidate_user_id : row.recruiter_user_id,
                    otherUserFullName: row.other_user_full_name,
                    otherUserProfileImageUrl: row.other_user_profile_image_url,
                    finalState: row.final_state,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                    userLocation: userLat != null && userLng != null ? { latitude: userLat, longitude: userLng } : null,
                    otherUserLocation: otherLat != null && otherLng != null ? { latitude: otherLat, longitude: otherLng } : null,
                };
            }),
            total,
            page,
            limit,
        };
    }

    async dismissReview(matchId: bigint, userId: bigint): Promise<boolean> {
        const query = `
            UPDATE matches
            SET
                recruiter_review_id = CASE WHEN recruiter_user_id = $1 AND recruiter_review_id IS NULL THEN -1 ELSE recruiter_review_id END,
                candidate_review_id = CASE WHEN candidate_user_id = $1 AND candidate_review_id IS NULL THEN -1 ELSE candidate_review_id END
            WHERE id = $2
              AND (recruiter_user_id = $1 OR candidate_user_id = $1)
              AND (
                  (recruiter_user_id = $1 AND recruiter_review_id IS NULL)
                  OR (candidate_user_id = $1 AND candidate_review_id IS NULL)
              )
        `;
        const result = await this.db.query(query, [userId, matchId]);
        return (result.rowCount ?? 0) > 0;
    }

    async getPendingReviewMatch(userId: bigint): Promise<PendingReviewMatch | null> {
        const query = `
            SELECT
                m.id,
                m.recruiter_user_id,
                m.candidate_user_id,
                m.created_at,
                up.full_name         AS other_user_full_name,
                up.profile_image_url AS other_user_profile_image_url
            FROM matches m
            JOIN user_profiles up ON up.user_id = CASE
                WHEN m.recruiter_user_id = $1 THEN m.candidate_user_id
                ELSE m.recruiter_user_id
            END
            WHERE (m.recruiter_user_id = $1 OR m.candidate_user_id = $1)
              AND m.proposal_accepted_count = m.total_users
              AND m.created_at + ($2 * INTERVAL '1 minute') <= NOW()
              AND (
                  (m.recruiter_user_id = $1 AND m.recruiter_review_id IS NULL)
                  OR
                  (m.candidate_user_id = $1 AND m.candidate_review_id IS NULL)
              )
            ORDER BY m.created_at ASC
            LIMIT 1
        `;
        const result: QueryResult<PendingReviewMatchRow> = await this.db.query(query, [userId, config.review.reviewEligibleAfterMinutes]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return {
            matchId: row.id,
            otherUserId: row.recruiter_user_id == userId ? row.candidate_user_id : row.recruiter_user_id,
            otherUserFullName: row.other_user_full_name,
            otherUserProfileImageUrl: row.other_user_profile_image_url,
            createdAt: row.created_at,
        };
    }
}

export const matchRepository = new MatchRepository(DatabaseService.getInstance());
