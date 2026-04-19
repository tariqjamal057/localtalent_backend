import { Router } from 'express';
import { z } from 'zod';
import { categoryController } from '../controllers/category.controller';
import validate, { VALIDATION_SOURCE } from '../middleware/validate';
import authenticate from '../middleware/authenticate';

const router = Router();

const parentParamsSchema = z.object({
    parentCategoryId: z.string()
});

const levelParamsSchema = z.object({
    hierarchyLevel: z.coerce.number().int().min(1),
});

const onlyActiveQuerySchema = z.object({
    onlyActive: z
        .enum(["true", "false"])
        .default("true")
        .transform(v => v === "true"),
});

router.get(
    '/parent/:parentCategoryId',
    authenticate,
    validate(parentParamsSchema, VALIDATION_SOURCE.PARAMS),
    validate(onlyActiveQuerySchema, VALIDATION_SOURCE.QUERY),
    categoryController.getByParentCategoryId
);

router.get(
    '/level/:hierarchyLevel',
    authenticate,
    validate(levelParamsSchema, VALIDATION_SOURCE.PARAMS),
    validate(onlyActiveQuerySchema, VALIDATION_SOURCE.QUERY),
    categoryController.getCategoriesByHierarchyLevel
);

export default router;
