import { z } from 'zod';

const createReviewZodSchema = z.object({
  body: z.object({
    productId: z.string({ required_error: 'Product id is required' }),
    rating: z.number({ required_error: 'Rating is required' }).min(1).max(5),
    comment: z.string({ required_error: 'Product review required' }),
  }),
});

const getReviewsZodSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional(),
  }),
});

export const ReviewValidation = { createReviewZodSchema, getReviewsZodSchema };
