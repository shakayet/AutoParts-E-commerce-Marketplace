/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Category } from '../category/category.model';
import { CategoryRequest } from './categoryRequest.model';
import { ICategoryRequest } from './categoryRequest.interface';
import { Notification } from '../notification/notification.model';
import QueryBuilder from '../../builder/QueryBuilder';

type PaginatedResult<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

const createCategoryRequestToDB = async (
  requesterId: string,
  payload: Partial<ICategoryRequest>,
) => {
  try {
    const reqDoc = await CategoryRequest.create({
      requesterId,
      name: payload.name,
      image: payload.image,
      description: payload.description,
    } as Partial<ICategoryRequest>);
    return reqDoc;
  } catch (error: any) {
    if (
      error?.code === 11000 &&
      typeof error?.message === 'string' &&
      error.message.includes('icon_1')
    ) {
      try {
        await CategoryRequest.collection.dropIndex('icon_1');
        const reqDoc = await CategoryRequest.create({
          requesterId,
          name: payload.name,
          image: payload.image,
          description: payload.description,
        } as Partial<ICategoryRequest>);
        return reqDoc;
      } catch (innerErr) {
        throw innerErr;
      }
    }
    throw error;
  }
};

const getCategoryRequestsFromDB = async (
  query: any = {},
): Promise<PaginatedResult<ICategoryRequest>> => {
  const searchableFields = ['name', 'description'];
  const queryBuilder = new QueryBuilder(CategoryRequest.find({}), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const [categoryRequests, total] = await Promise.all([
    queryBuilder.modelQuery.exec(),
    queryBuilder.getPaginationInfo(),
  ]);

  return {
    data: categoryRequests as ICategoryRequest[],
    meta: {
      total: total.total,
      page: total.page,
      limit: total.limit,
      totalPages: total.totalPage,
    },
  };
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
          image: req.image || 'https://i.ibb.co/z5YHLV9/profile.png', // Fallback for required field
          slug,
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

const deleteCategoryRequestFromDB = async (id: string) => {
  const res = await CategoryRequest.findByIdAndDelete(id);
  if (!res)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category request not found');
};

export const CategoryRequestService = {
  createCategoryRequestToDB,
  getCategoryRequestsFromDB,
  reviewCategoryRequestToDB,
  deleteCategoryRequestFromDB,
};
