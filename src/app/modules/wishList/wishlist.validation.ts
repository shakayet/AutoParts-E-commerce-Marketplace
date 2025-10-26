import { z } from 'zod';

export const WishlistValidation = {
  addToWishlist: z.object({
    body: z.object({
      productId: z.string({ required_error: 'Product ID is required' }),
    }),
  }),

  removeFromWishlist: z.object({
    params: z.object({
      productId: z.string({ required_error: 'Product ID is required' }),
    }),
  }),
};
