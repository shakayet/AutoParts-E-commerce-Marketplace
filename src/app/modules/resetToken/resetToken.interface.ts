/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export type IResetToken = {
  user: Types.ObjectId;
  token: string;
  expireAt: Date;
};

export type ResetTokenModel = {
  isExistToken(token: string): Promise<IResetToken | null>;
  isExpireToken(token: string): boolean;
} & Model<IResetToken>;
