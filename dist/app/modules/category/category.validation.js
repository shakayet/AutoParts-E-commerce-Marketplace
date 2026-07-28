"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryValidation = exports.createCategoryZodSchema = void 0;
const zod_1 = require("zod");
exports.createCategoryZodSchema = zod_1.z.object({
    name: zod_1.z.string({ required_error: 'Name is required' }),
    slug: zod_1.z.string().optional(), // optional if you plan to generate from name
    image: zod_1.z.string({ required_error: 'Image is required' }),
    icon: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
const updateCategoryZodSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    slug: zod_1.z.string().optional(), // optional if you plan to generate from name
    image: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
const getCategoriesZodSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.string().optional(),
        searchTerm: zod_1.z.string().optional(),
    }),
});
exports.CategoryValidation = {
    createCategoryZodSchema: exports.createCategoryZodSchema,
    updateCategoryZodSchema,
    getCategoriesZodSchema,
};
