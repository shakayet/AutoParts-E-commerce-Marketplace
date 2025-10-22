/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from 'mongoose';
import { ICategoryRequest } from './categoryRequest.interface';

const categoryRequestSchema = new Schema<ICategoryRequest>(
  {
    requesterId: { type: (Schema.Types.ObjectId as any), ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

export const CategoryRequest = model<ICategoryRequest>('CategoryRequest', categoryRequestSchema as any);
export type { ICategoryRequest };
