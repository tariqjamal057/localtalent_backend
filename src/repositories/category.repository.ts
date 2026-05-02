import { QueryResult } from 'pg';
import { DatabaseService } from '../config/database';
import { Category, CategoryRow, CreateCategoryDto, UpdateCategoryDto } from '../types/category.types';
import { categoryRowToDto } from '../utils/mappers/category.mapper';
import { LANGUAGE } from '../enums/language';

export type { Category, CreateCategoryDto, UpdateCategoryDto };

export class CategoryRepository {
    constructor(private readonly db: DatabaseService) { }

    async getById(categoryId: bigint, language: LANGUAGE): Promise<Category | null> {
        const query = `
            SELECT *
            FROM categories
            WHERE id = $1
            LIMIT 1
        `;
        const values = [categoryId];
        const result: QueryResult<CategoryRow> = await this.db.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        return categoryRowToDto(result.rows[0], language);
    }

    async getByParentCategoryId(parentCategoryId: bigint, onlyActive = true, language: LANGUAGE): Promise<Category[]> {
        const query = `
            SELECT *
            FROM categories
            WHERE parent_category_id = $1
            AND ($2 = FALSE OR is_active = TRUE)
        `;
        const values = [parentCategoryId, onlyActive];
        const result: QueryResult<CategoryRow> = await this.db.query(query, values);
        return result.rows.map(row => categoryRowToDto(row, language));
    }

    async getCategoriesByHierarchyLevel(hierarchyLevel: number, onlyActive = true, language: LANGUAGE): Promise<Category[]> {
        const query = `
            SELECT *
            FROM categories
            WHERE hierarchy_level = $1
            AND ($2 = FALSE OR is_active = TRUE)
        `;
        const values = [hierarchyLevel, onlyActive];
        const result: QueryResult<CategoryRow> = await this.db.query(query, values);
        return result.rows.map(row => categoryRowToDto(row, language));
    }
}

export const categoryRepository = new CategoryRepository(DatabaseService.getInstance());
