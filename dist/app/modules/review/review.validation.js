"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewValidation = void 0;
const zod_1 = require("zod");
const createReviewZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        productId: zod_1.z.string({ required_error: 'Product id is required' }),
        rating: zod_1.z.number({ required_error: 'Rating is required' }).min(1).max(5),
        comment: zod_1.z.string({ required_error: 'Product review required' }),
    }),
});
const getReviewsZodSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.string().optional(),
    }),
});
exports.ReviewValidation = { createReviewZodSchema, getReviewsZodSchema };
//# sourceMappingURL=review.validation.js.map