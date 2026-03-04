import { z } from 'zod';

const createReportZodSchema = z.object({
  type: z.enum(['product', 'seller']),
  targetId: z.string({ required_error: 'Target id is required' }),
  reason: z.string({ required_error: 'Reason is required' }),
  image: z.string().optional(),
});

const getReportsZodSchema = z.object({
  query: z.object({
    type: z.enum(['product', 'seller']).optional(),
    targetId: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional(),
  }),
});

const updateReportStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'reviewed', 'dismissed']),
  }),
});

export const ReportValidation = {
  createReportZodSchema,
  getReportsZodSchema,
  updateReportStatusZodSchema,
};
