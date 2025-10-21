import { z } from 'zod';

const createTermsZodSchema = z.object({
  body: z.object({ title: z.string({ required_error: 'Title is required' }), content: z.string({ required_error: 'Content is required' }), isActive: z.boolean().optional() }),
});

const updateTermsZodSchema = z.object({
  body: z.object({ title: z.string().optional(), content: z.string().optional(), isActive: z.boolean().optional() }),
});

export const TermsValidation = { createTermsZodSchema, updateTermsZodSchema };
