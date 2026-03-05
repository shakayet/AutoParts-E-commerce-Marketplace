/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { Wishlist } from './wishlist.model';
import { Product } from '../product/product.model';
import { IWishlist } from './wishlist.interface';
import QueryBuilder from '../../builder/QueryBuilder';

type PaginatedResult<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

const addToWishlist = async (userId: string, productId: string) => {
  const productExists = await Product.findById(productId);
  if (!productExists) throw new Error('Product not found');

  const existing = await Wishlist.findOne({ userId, productId });
  if (existing) throw new Error('Product already in wishlist');

  const result = await Wishlist.create({
    userId: new Types.ObjectId(userId),
    productId: new Types.ObjectId(productId),
  });

  return result;
};

const getWishlist = async (
  userId: string,
  query: any = {},
): Promise<PaginatedResult<IWishlist>> => {
  const queryBuilder = new QueryBuilder(
    Wishlist.find({ userId }).populate('productId'),
    query,
  )
    .sort()
    .paginate()
    .fields();

  const [wishlist, total] = await Promise.all([
    queryBuilder.modelQuery.exec(),
    queryBuilder.getPaginationInfo(),
  ]);

  return {
    data: wishlist as IWishlist[],
    meta: {
      total: total.total,
      page: total.page,
      limit: total.limit,
      totalPages: total.totalPage,
    },
  };
};

const removeFromWishlist = async (userId: string, productId: string) => {
  const result = await Wishlist.findOneAndDelete({ userId, productId });
  if (!result) throw new Error('Product not found in wishlist');
  return result;
};

export const WishlistService = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
