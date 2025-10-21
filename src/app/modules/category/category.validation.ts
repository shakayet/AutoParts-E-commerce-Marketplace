import { z } from 'zod';

const createCategoryZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    description: z.string().optional(),
  }),
});

const updateCategoryZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  }),
});

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

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
  createCategoryRequestZodSchema,
  reviewCategoryRequestZodSchema,
};
