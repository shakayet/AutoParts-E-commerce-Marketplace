import { z } from 'zod';

export const WishlistValidation = {
  addToWishlist: z.object({
    body: z.object({
      productId: z.string({ required_error: 'Product ID is required' }),
    }),
  }),

  getWishlist: z.object({
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.string().optional(),
    }),
  }),

  removeFromWishlist: z.object({
    params: z.object({
      productId: z.string({ required_error: 'Product ID is required' }),
    }),
  }),
};
