/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Category } from './category.model';
import StorageService from '../../services/storage.service';
import { CategoryRequest } from './categoryRequest.model';
import { ICategory } from './category.interface';
import { ICategoryRequest } from './categoryRequest.interface';
import { Notification } from '../notification/notification.model';
import QueryBuilder from '../../builder/QueryBuilder';

type PaginatedResult<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

const createCategoryToDB = async (payload: Partial<ICategory>) => {
  // if an icon path from local uploads is provided, upload it to S3 first
  if (payload.icon && typeof payload.icon === 'string') {
    const icon = payload.icon as string;
    if (
      icon.startsWith('/image/') ||
      icon.startsWith('/media/') ||
      icon.startsWith('/doc/')
    ) {
      const localPath = require('path').join(
        process.cwd(),
        'uploads',
        icon.replace(/^\//, ''),
      );
      const url = await StorageService.uploadLocalFile(localPath);
      payload.icon = url;
    }
  }

  const exists = await Category.findOne({ name: payload.name });
  if (exists)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Category already exists');
  const cat = await Category.create(payload as Partial<ICategory>);
  return cat;
};

const updateCategoryToDB = async (id: string, payload: Partial<ICategory>) => {
  const existing = await Category.findById(id);
  if (!existing)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');

  // if incoming payload includes a new icon, upload it to S3 (if it's a local path)
  if (payload.icon && typeof payload.icon === 'string') {
    const icon = payload.icon as string;
    if (
      icon.startsWith('/image/') ||
      icon.startsWith('/media/') ||
      icon.startsWith('/doc/')
    ) {
      const localPath = require('path').join(
        process.cwd(),
        'uploads',
        icon.replace(/^\//, ''),
      );
      const url = await StorageService.uploadLocalFile(localPath);
      payload.icon = url;
    }
  }

  if (payload.icon && existing.icon) {
    await StorageService.deleteByUrl(existing.icon as string);
  }

  const cat = await Category.findByIdAndUpdate(
    id,
    payload as Partial<ICategory>,
    { new: true },
  );
  if (!cat) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  return cat;
};

const deleteCategoryFromDB = async (id: string) => {
  const res = await Category.findByIdAndDelete(id);
  if (!res) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  if (res.icon) {
    await StorageService.deleteByUrl(res.icon as string);
  }
};

const getSingleCategoryFromDB = async (id: string) => {
  const res = await Category.findOne({ _id: id });
  if (!res) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  return res;
};

const getCategoriesFromDB = async (
  query: any = {},
): Promise<PaginatedResult<ICategory>> => {
  const searchableFields = ['name', 'description'];
  const queryBuilder = new QueryBuilder(Category.find({}), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const [categories, total] = await Promise.all([
    queryBuilder.modelQuery.exec(),
    queryBuilder.getPaginationInfo(),
  ]);

  return {
    data: categories as ICategory[],
    meta: {
      total: total.total,
      page: total.page,
      limit: total.limit,
      totalPages: total.totalPage,
    },
  };
};

// category request flows
const createCategoryRequestToDB = async (
  requesterId: string,
  payload: Partial<ICategoryRequest>,
) => {
  const reqDoc = await CategoryRequest.create({
    requesterId,
    ...payload,
  } as Partial<ICategoryRequest>);
  return reqDoc;
};

const getCategoryRequestsFromDB = async () => {
  return await CategoryRequest.find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .populate('requesterId', 'name email');
};

const reviewCategoryRequestToDB = async (
  id: string,
  status: 'approved' | 'rejected',
  adminComment?: string,
) => {
  const req = await CategoryRequest.findById(id).populate(
    'requesterId',
    '_id name email',
  );
  if (!req)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category request not found');

  req.status = status as 'approved' | 'rejected' | 'pending';
  await req.save();

  if (status === 'approved') {
    const slug = req.name
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    await Category.findOneAndUpdate(
      { name: req.name },
      {
        $set: {
          name: req.name,
          description: req.description,
          slug,
          icon: req.icon,
        },
      },
      { upsert: true, new: true },
    );
  }

  // notify requester
  try {
    const notification = await Notification.create({
      user: req.requesterId as unknown as string,
      type:
        status === 'approved'
          ? 'CATEGORY_REQUEST_APPROVED'
          : 'CATEGORY_REQUEST_REJECTED',
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
  getSingleCategoryFromDB,
};
