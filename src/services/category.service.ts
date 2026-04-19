import { LANGUAGE } from '../enums/language';
import { categoryRepository, CategoryRepository, Category } from '../repositories/category.repository';

export class CategoryService {
    constructor(private readonly categoryRepository: CategoryRepository) { }

    async getByParentCategoryId(parentCategoryId: bigint, onlyActive = true, language: LANGUAGE): Promise<Category[]> {
        return this.categoryRepository.getByParentCategoryId(parentCategoryId, onlyActive, language);
    }

    async getCategoriesByHierarchyLevel(hierarchyLevel: number, onlyActive = true, language: LANGUAGE): Promise<Category[]> {
        return this.categoryRepository.getCategoriesByHierarchyLevel(hierarchyLevel, onlyActive, language);
    }
}

export const categoryService = new CategoryService(categoryRepository);
