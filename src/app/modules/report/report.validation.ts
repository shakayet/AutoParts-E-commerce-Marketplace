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
  }),
});

export const ReportValidation = { createReportZodSchema, getReportsZodSchema };
