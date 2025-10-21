/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from 'mongoose';
import { IReport } from './report.interface';

const reportSchema = new Schema<IReport>(
  {
  reporterId: { type: (Schema.Types.ObjectId as any), ref: 'User', required: true },
    type: { type: String, enum: ['product', 'seller'], required: true },
  targetId: { type: (Schema.Types.ObjectId as any), required: true },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

reportSchema.index({ type: 1, targetId: 1 });

export const Report = model<IReport>('Report', reportSchema as any);
