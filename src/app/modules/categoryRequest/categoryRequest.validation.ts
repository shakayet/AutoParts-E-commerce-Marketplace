import { z } from 'zod';

const createCategoryRequestZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    description: z.string().optional(),
  }),
});

const reviewCategoryRequestZodSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected']),
    adminComment: z.string().optional(),
  }),
});

export const CategoryRequestValidation = {
  createCategoryRequestZodSchema,
  reviewCategoryRequestZodSchema,
};
