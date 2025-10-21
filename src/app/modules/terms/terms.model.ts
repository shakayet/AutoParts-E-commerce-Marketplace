/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from 'mongoose';
import { ITerms } from './terms.interface';

const termsSchema = new Schema<ITerms>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Terms = model<ITerms>('Terms', termsSchema as any);
