"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRequestValidation = void 0;
const zod_1 = require("zod");
const createCategoryRequestZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        image: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
    }),
});
const reviewCategoryRequestZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['approved', 'rejected']),
        adminComment: zod_1.z.string().optional(),
    }),
});
exports.CategoryRequestValidation = {
    createCategoryRequestZodSchema,
    reviewCategoryRequestZodSchema,
};
//# sourceMappingURL=categoryRequest.validation.js.map