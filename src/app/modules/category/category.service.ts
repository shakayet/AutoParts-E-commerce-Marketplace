/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Category } from './category.model';
import { CategoryRequest } from './categoryRequest.model';
import { ICategory } from './category.interface';
import { ICategoryRequest } from './categoryRequest.interface';
import { Notification } from '../notification/notification.model';

const createCategoryToDB = async (payload: Partial<ICategory>) => {
  const exists = await Category.findOne({ name: payload.name });
  if (exists) throw new ApiError(StatusCodes.BAD_REQUEST, 'Category already exists');
  const cat = await Category.create(payload as Partial<ICategory>);
  return cat;
};

const updateCategoryToDB = async (id: string, payload: Partial<ICategory>) => {
  const cat = await Category.findByIdAndUpdate(id, payload as Partial<ICategory>, { new: true });
  if (!cat) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  return cat;
};

const deleteCategoryFromDB = async (id: string) => {
  const res = await Category.findByIdAndDelete(id);
  if (!res) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
};

const getCategoriesFromDB = async () => {
  return await Category.find({}).sort({ name: 1 });
};

// category request flows
const createCategoryRequestToDB = async (requesterId: string, payload: Partial<ICategoryRequest>) => {
  const reqDoc = await CategoryRequest.create({ requesterId, ...payload } as Partial<ICategoryRequest>);
  return reqDoc;
};

const getCategoryRequestsFromDB = async () => {
  return await CategoryRequest.find({}).sort({ createdAt: -1 }).limit(500).populate('requesterId', 'name email');
};

const reviewCategoryRequestToDB = async (id: string, status: 'approved' | 'rejected', adminComment?: string) => {
  const req = await CategoryRequest.findById(id).populate('requesterId');
  if (!req) throw new ApiError(StatusCodes.NOT_FOUND, 'Category request not found');

  req.status = status as 'approved' | 'rejected' | 'pending';
  await req.save();

  if (status === 'approved') {
    // create category if not exists
    const exists = await Category.findOne({ name: req.name });
    if (!exists) {
      const slug = req.name.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await Category.create({ name: req.name, description: req.description, slug } as Partial<ICategory>);
    }
  }

  // notify requester
  try {
    const notification = await Notification.create({
      user: req.requesterId as unknown as string,
      type: status === 'approved' ? 'CATEGORY_REQUEST_APPROVED' : 'CATEGORY_REQUEST_REJECTED',
      data: { requestId: req._id, status, adminComment },
    });
    // emit via socket if available
    try {
      const io = (globalThis as any).io;
      const toId = String(req.requesterId);
      if (io && toId) io.to(toId).emit('CATEGORY_REQUEST_UPDATE', notification);
    } catch (err) {
      // log and continue
      // eslint-disable-next-line no-console
      console.error(err);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return req;
};

export const CategoryService = {
  createCategoryToDB,
  updateCategoryToDB,
  deleteCategoryFromDB,
  getCategoriesFromDB,
  createCategoryRequestToDB,
  getCategoryRequestsFromDB,
  reviewCategoryRequestToDB,
};
