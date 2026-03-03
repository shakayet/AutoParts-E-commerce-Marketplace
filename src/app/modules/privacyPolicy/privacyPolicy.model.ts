/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from 'mongoose';
import { IPrivacyPolicy } from './privacyPolicy.interface';

const privacyPolicySchema = new Schema<IPrivacyPolicy>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const PrivacyPolicy = model<IPrivacyPolicy>(
  'PrivacyPolicy',
  privacyPolicySchema as any,
);
