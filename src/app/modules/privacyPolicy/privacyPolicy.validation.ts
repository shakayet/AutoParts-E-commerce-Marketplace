import { z } from 'zod';

const createPrivacyPolicyZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    description: z.string({ required_error: 'Description is required' }),
    isActive: z.boolean().optional(),
  }),
});

const updatePrivacyPolicyZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const PrivacyPolicyValidation = {
  createPrivacyPolicyZodSchema,
  updatePrivacyPolicyZodSchema,
};
