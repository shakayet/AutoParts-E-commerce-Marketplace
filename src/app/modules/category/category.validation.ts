import { z } from 'zod';

export const createCategoryZodSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  slug: z.string().optional(), // optional if you plan to generate from name

  description: z.string().optional(),
});

const updateCategoryZodSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(), // optional if you plan to generate from name

  description: z.string().optional(),
});

const getCategoriesZodSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional(),
    searchTerm: z.string().optional(),
  }),
});

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
  getCategoriesZodSchema,
};
