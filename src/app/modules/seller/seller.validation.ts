import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const getSellerLocationZodSchema = z.object({
  params: z.object({
    id: z
      .string({ required_error: 'Seller id is required' })
      .regex(objectIdRegex, 'Invalid seller id format'),
  }),
});

export const SellerValidation = { getSellerLocationZodSchema };
