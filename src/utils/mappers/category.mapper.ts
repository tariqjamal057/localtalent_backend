import { LANGUAGE } from '../../enums/language';
import { Category, CategoryRow } from '../../types/category.types';
import { translate } from '../translation';

export function categoryRowToDto(row: CategoryRow, language: LANGUAGE): Category {
    return {
        id: row.id,
        title: translate(row.title_translations as Record<string, string>, language),
        hierarchyLevel: row.hierarchy_level,
        parentCategoryId: row.parent_category_id,
        hasChildren: row.has_children,
        recruiterCtaText: translate(row.recruiter_cta_text as Record<string, string>, language),
        candidateCtaText: translate(row.candidate_cta_text as Record<string, string>, language),
        actionCtaText: translate(row.action_cta_text as Record<string, string>, language),
        isFree: row.is_free,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
