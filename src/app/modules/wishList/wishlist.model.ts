/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from 'mongoose';
import { IWishlist, WishlistModel } from './wishlist.interface';

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Product',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate wishlist items for same user-product pair
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Wishlist = model<IWishlist, WishlistModel>('Wishlist', wishlistSchema);
