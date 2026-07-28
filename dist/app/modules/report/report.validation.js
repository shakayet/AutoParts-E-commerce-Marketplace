"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportValidation = void 0;
const zod_1 = require("zod");
const createReportZodSchema = zod_1.z.object({
    type: zod_1.z.enum(['product', 'seller']),
    targetId: zod_1.z.string({ required_error: 'Target id is required' }),
    reason: zod_1.z.string({ required_error: 'Reason is required' }),
    image: zod_1.z.string().optional(),
});
const getReportsZodSchema = zod_1.z.object({
    query: zod_1.z.object({
        type: zod_1.z.enum(['product', 'seller']).optional(),
        targetId: zod_1.z.string().optional(),
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.string().optional(),
    }),
});
const updateReportStatusZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['pending', 'reviewed', 'dismissed', 'resolved']),
    }),
});
const reviewReportZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['resolved', 'dismissed']),
        explanation: zod_1.z.string({ required_error: 'Explanation is required' }),
    }),
});
exports.ReportValidation = {
    createReportZodSchema,
    getReportsZodSchema,
    updateReportStatusZodSchema,
    reviewReportZodSchema,
};
