import { z } from 'zod';

export const createCategoryZodSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  slug: z.string().optional(), // optional if you plan to generate from name
  icon: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
});

const updateCategoryZodSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(), // optional if you plan to generate from name
  icon: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
});

const createCategoryRequestZodSchema = z.object({
    name: z.string({ required_error: 'Name is required' }),
    description: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
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
