import { z } from 'zod';

const createProductZodSchema = z.object({
    title: z.string({ required_error: 'Title is required' }),
    category: z.string({ required_error: 'Category is required' }),
    brand: z.string().optional(),
    description: z.string().optional(),
    carModels: z.array(z.string()).optional(),
    chassisNumber: z.string().optional(),
    condition: z.enum(['new', 'used', 'refurbished']).optional(),
    warranty: z.string().optional(),
    price: z.number({ required_error: 'Price is required' }),
    discount: z.number().optional(),
});

const updateProductZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    description: z.string().optional(),
    carModels: z.array(z.string()).optional(),
    chassisNumber: z.string().optional(),
    condition: z.enum(['new', 'used', 'refurbished']).optional(),
    warranty: z.string().optional(),
    price: z.number().optional(),
    discount: z.number().optional(),
  }),
});

const productQueryZodSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    brand: z.string().optional(),
    carModel: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    chassisNumber: z.string().optional(),
    keyword: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const ProductValidation = {
  createProductZodSchema,
  updateProductZodSchema,
  productQueryZodSchema,
};
