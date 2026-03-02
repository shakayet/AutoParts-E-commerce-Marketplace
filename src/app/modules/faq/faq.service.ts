/* eslint-disable @typescript-eslint/no-explicit-any */
import { FAQ } from './faq.model';
import StorageService from '../../services/storage.service';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const createFAQToDB = async (payload: Partial<any>) => {
  const doc = await FAQ.create(payload);
  return doc;
};

const updateFAQToDB = async (id: string, payload: Partial<any>) => {
  const existing = await FAQ.findById(id);
  if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'FAQ not found');

  if (payload.image && existing.image) {
    await StorageService.deleteByUrl(existing.image as string);
  }

  const doc = await FAQ.findByIdAndUpdate(id, payload, { new: true });
  if (!doc) throw new ApiError(StatusCodes.NOT_FOUND, 'FAQ not found');
  return doc;
};

const deleteFAQFromDB = async (id: string) => {
  const res = await FAQ.findByIdAndDelete(id);
  if (!res) throw new ApiError(StatusCodes.NOT_FOUND, 'FAQ not found');
  if (res.image) {
    await StorageService.deleteByUrl(res.image as string);
  }
};

const getFAQsFromDB = async () => {
  return await FAQ.find({ isActive: true }).sort({ createdAt: -1 });
};

export const FAQService = {
  createFAQToDB,
  updateFAQToDB,
  deleteFAQFromDB,
  getFAQsFromDB,
};
