import { Model } from 'mongoose';

export type IReview = {
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
};

export type ReviewModel = object & Model<IReview>;
