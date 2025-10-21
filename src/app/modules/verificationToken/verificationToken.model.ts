/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from 'mongoose';

export type IVerificationToken = {
  user: Schema.Types.ObjectId | string;
  otp: number;
  expireAt: Date;
  attempts?: number;
};

const verificationTokenSchema = new Schema<IVerificationToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    otp: { type: Number, required: true },
      expireAt: { type: Date, required: true },
      attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

verificationTokenSchema.statics.isValidOtp = async function (userId: string, otp: number) {
  const record = await VerificationToken.findOne({ user: userId, otp, expireAt: { $gt: new Date() } });
  return !!record;
};

export const VerificationToken = model<IVerificationToken>('VerificationToken', verificationTokenSchema as any);
