/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Product } from './product.model';
import { IProduct } from './product.interface';

type PaginatedResult<T> = { data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } };

const createProductToDB = async (payload: Partial<IProduct>): Promise<IProduct> => {
  const product = await Product.create(payload as Partial<IProduct>);
  if (!product) throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create product');
  return product as unknown as IProduct;
};

const updateProductToDB = async (id: string, payload: Partial<IProduct>): Promise<IProduct> => {
  const product = await Product.findByIdAndUpdate(id, payload as any, { new: true });
  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  return product as unknown as IProduct;
};

const deleteProductFromDB = async (id: string): Promise<void> => {
  const res = await Product.findByIdAndDelete(id);
  if (!res) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
};

const getProductByIdFromDB = async (id: string): Promise<IProduct> => {
  const product = await Product.findById(id).populate('sellerId', 'name email location');
  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  return product as unknown as IProduct;
};

const getProductsFromDB = async (filter: any = {}): Promise<PaginatedResult<IProduct>> => {
  const q: any = { isBlocked: false };
  if (filter.category) q.category = filter.category;
  if (filter.brand) q.brand = filter.brand;
  if (filter.carModel) q.carModels = { $in: [filter.carModel] };
  if (filter.chassisNumber) q.chassisNumber = filter.chassisNumber;
  if (filter.keyword) q.$text = { $search: filter.keyword };
  const page = Number(filter.page || 1);
  const limit = Number(filter.limit || 20);

  const total = await Product.countDocuments(q);
  const products = await Product.find(q).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });

  return {
    data: products as unknown as IProduct[],
    meta: {
      total: Number(total),
      page,
      limit,
      totalPages: Math.ceil(Number(total) / limit) || 0,
    },
  };
};

const getRelatedProducts = async (productId: string): Promise<IProduct[]> => {
  const prod = await Product.findById(productId);
  if (!prod) return [];
  const related = await Product.find({ _id: { $ne: prod._id }, category: prod.category })
    .sort({ averageRating: -1 })
    .limit(4);
  return related as unknown as IProduct[];
};

export const ProductService = {
  createProductToDB,
  updateProductToDB,
  deleteProductFromDB,
  getProductByIdFromDB,
  getProductsFromDB,
  getRelatedProducts,
};
