/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from 'mongoose';
import { IReview, ReviewModel } from './review.interface';

const reviewSchema = new Schema<IReview, ReviewModel>(
  {
    productId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Product',
      required: true,
    },
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review = model<IReview, ReviewModel>(
  'Review',
  reviewSchema as any
);
