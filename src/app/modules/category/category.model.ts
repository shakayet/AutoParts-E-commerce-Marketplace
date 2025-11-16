/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from 'mongoose';
import { ICategory } from './category.interface';

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, required: false, unique: true },
    image: { type: String, required: false },
    description: { type: String },
  },
  { timestamps: true }
);

// categorySchema.index({ name: 1 });

export const Category = model<ICategory>('Category', categorySchema as any);
export type { ICategory };
