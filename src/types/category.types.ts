export interface Category {
    id: bigint;
    title: string;
    hierarchyLevel: number;
    parentCategoryId: bigint | null;
    hasChildren: boolean;
    recruiterCtaText: string | null;
    candidateCtaText: string | null;
    actionCtaText: string | null;
    isFree: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCategoryDto {
    title: string;
    titleTranslations?: Record<string, string>;
    hierarchyLevel?: number;
    parentCategoryId?: bigint | null;
    hasChildren?: boolean;
    recruiterCtaText?: Record<string, unknown>;
    candidateCtaText?: Record<string, unknown>;
    actionCtaText?: Record<string, unknown>;
    isFree?: boolean;
    isActive?: boolean;
}

export interface UpdateCategoryDto {
    title?: string;
    titleTranslations?: Record<string, string>;
    hierarchyLevel?: number;
    parentCategoryId?: bigint | null;
    hasChildren?: boolean;
    recruiterCtaText?: Record<string, unknown>;
    candidateCtaText?: Record<string, unknown>;
    actionCtaText?: Record<string, unknown>;
    isFree?: boolean;
    isActive?: boolean;
}

export interface CategoryRow {
    id: bigint;
    title: string;
    title_translations: Record<string, string> | null;
    hierarchy_level: number;
    parent_category_id: bigint | null;
    has_children: boolean;
    recruiter_cta_text: Record<string, unknown> | null;
    candidate_cta_text: Record<string, unknown> | null;
    action_cta_text: Record<string, unknown> | null;
    is_free: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
