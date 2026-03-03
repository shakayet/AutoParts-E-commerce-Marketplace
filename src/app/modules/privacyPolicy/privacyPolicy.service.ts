/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrivacyPolicy } from './privacyPolicy.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const createPrivacyPolicyToDB = async (payload: Partial<any>) => {
  const doc = await PrivacyPolicy.create(payload);
  return doc;
};

const updatePrivacyPolicyToDB = async (id: string, payload: Partial<any>) => {
  const doc = await PrivacyPolicy.findByIdAndUpdate(id, payload, { new: true });
  if (!doc)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Privacy policy not found');
  return doc;
};

const deletePrivacyPolicyFromDB = async (id: string) => {
  const res = await PrivacyPolicy.findByIdAndDelete(id);
  if (!res)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Privacy policy not found');
};

const getPrivacyPoliciesFromDB = async () => {
  return await PrivacyPolicy.find({ isActive: true }).sort({ createdAt: -1 });
};

export const PrivacyPolicyService = {
  createPrivacyPolicyToDB,
  updatePrivacyPolicyToDB,
  deletePrivacyPolicyFromDB,
  getPrivacyPoliciesFromDB,
};
