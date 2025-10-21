/* eslint-disable @typescript-eslint/no-explicit-any */
import { Terms } from './terms.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const createTermsToDB = async (payload: Partial<any>) => {
  const doc = await Terms.create(payload);
  return doc;
};

const updateTermsToDB = async (id: string, payload: Partial<any>) => {
  const doc = await Terms.findByIdAndUpdate(id, payload, { new: true });
  if (!doc) throw new ApiError(StatusCodes.NOT_FOUND, 'Terms not found');
  return doc;
};

const deleteTermsFromDB = async (id: string) => {
  const res = await Terms.findByIdAndDelete(id);
  if (!res) throw new ApiError(StatusCodes.NOT_FOUND, 'Terms not found');
};

const getTermsFromDB = async () => {
  return await Terms.find({ isActive: true }).sort({ createdAt: -1 });
};

export const TermsService = { createTermsToDB, updateTermsToDB, deleteTermsFromDB, getTermsFromDB };
