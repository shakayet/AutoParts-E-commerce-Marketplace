/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Category } from './category.model';

import { ICategory } from './category.interface';

import QueryBuilder from '../../builder/QueryBuilder';

type PaginatedResult<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

const createCategoryToDB = async (payload: Partial<ICategory>) => {
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

export const CategoryService = {
  createCategoryToDB,
  updateCategoryToDB,
  deleteCategoryFromDB,
  getCategoriesFromDB,
  getSingleCategoryFromDB,
};
