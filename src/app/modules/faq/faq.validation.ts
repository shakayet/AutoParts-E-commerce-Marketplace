import { z } from 'zod';

const createFAQZodSchema = z.object({
  body: z.object({
    question: z.string({ required_error: 'Question is required' }),
    answer: z.string({ required_error: 'Answer is required' }),
    image: z.string().optional(),
  }),
});

const updateFAQZodSchema = z.object({
  body: z.object({
    question: z.string().optional(),
    answer: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const FAQValidation = { createFAQZodSchema, updateFAQZodSchema };
