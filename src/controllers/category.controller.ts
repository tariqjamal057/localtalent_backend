import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { categoryService, CategoryService } from '../services/category.service';
import { sendResponse } from '../utils/response';
import { DEFAULT_LANGUAGE, LANGUAGE, LANGUAGE_HEADER_KEY } from '../enums/language';
import { MESSAGES } from '../constants/messages';

export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    getByParentCategoryId = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const parentCategoryId = BigInt(req.params.parentCategoryId);
        const language = (req.headers[LANGUAGE_HEADER_KEY] || DEFAULT_LANGUAGE) as LANGUAGE;
        const onlyActive = req.query.onlyActive as unknown as boolean;
        const categories = await this.categoryService.getByParentCategoryId(parentCategoryId, onlyActive, language);
        sendResponse(res, StatusCodes.OK, MESSAGES.CATEGORY.FETCHED_SUCCESSFULLY, categories);
    };

    getCategoriesByHierarchyLevel = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const hierarchyLevel = req.params.hierarchyLevel as unknown as number;
        const onlyActive = req.query.onlyActive as unknown as boolean;
        const language = (req.headers[LANGUAGE_HEADER_KEY] || DEFAULT_LANGUAGE) as LANGUAGE;
        const categories = await this.categoryService.getCategoriesByHierarchyLevel(hierarchyLevel, onlyActive, language);
        sendResponse(res, StatusCodes.OK, MESSAGES.CATEGORY.FETCHED_SUCCESSFULLY, categories);
    };
}

export const categoryController = new CategoryController(categoryService);
