/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from 'mongoose';
import { IFAQ } from './faq.interface';

const faqSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    image: { type: String, default: true },
    isActive: { type: Boolean, default: true, required: true },
  },
  { timestamps: true }
);

export const FAQ = model<IFAQ>('FAQ', faqSchema as any);
