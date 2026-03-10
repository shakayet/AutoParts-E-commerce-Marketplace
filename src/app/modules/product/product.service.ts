/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Product } from './product.model';
import StorageService from '../../services/storage.service';
import { IProduct } from './product.interface';
import QueryBuilder from '../../builder/QueryBuilder';

type PaginatedResult<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

const createProductToDB = async (
  payload: Partial<IProduct>,
): Promise<IProduct> => {
  const product = await Product.create(payload as Partial<IProduct>);
  if (!product)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create product');
  return product as unknown as IProduct;
};

const updateProductToDB = async (
  id: string,
  payload: Partial<IProduct>,
): Promise<IProduct> => {
  // if the payload contains new images we should clean up the old ones
  const existing = await Product.findById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  if (payload.mainImage && existing.mainImage) {
    await StorageService.deleteByUrl(existing.mainImage);
  }

  if (payload.galleryImages && Array.isArray(payload.galleryImages)) {
    const newGallery = payload.galleryImages as string[];
    const oldGallery = existing.galleryImages || [];
    // delete any old urls that are not present in the new set
    for (const oldUrl of oldGallery) {
      if (!newGallery.includes(oldUrl)) {
        await StorageService.deleteByUrl(oldUrl);
      }
    }
  }

  const product = await Product.findByIdAndUpdate(id, payload as any, {
    new: true,
  });
  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  return product as unknown as IProduct;
};

const deleteProductFromDB = async (id: string): Promise<void> => {
  const res = await Product.findByIdAndDelete(id);
  if (!res) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');

  // clean up any images stored for this product
  if (res.mainImage) {
    await StorageService.deleteByUrl(res.mainImage);
  }
  if (res.galleryImages && Array.isArray(res.galleryImages)) {
    for (const url of res.galleryImages) {
      await StorageService.deleteByUrl(url);
    }
  }
};

const getProductByIdFromDB = async (id: string): Promise<IProduct> => {
  const product = await Product.findById(id).populate(
    'sellerId',
    'name coordinates address whatsappNumber',
  );
  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  return product as unknown as IProduct;
};

const getProductsFromDB = async (
  filter: any = {},
): Promise<PaginatedResult<IProduct>> => {
  const q: any = { isBlocked: false };
  if (filter.category) q.category = filter.category;
  if (filter.brand) q.brand = filter.brand;
  if (filter.carModel) q.carModels = { $in: [filter.carModel] };
  if (filter.chassisNumber) q.chassisNumber = filter.chassisNumber;
  if (filter.keyword) q.$text = { $search: filter.keyword };
  const page = Number(filter.page || 1);
  const limit = Number(filter.limit || 20);

  const total = await Product.countDocuments(q);
  const products = await Product.find(q)
    .populate('sellerId', 'name whatsappNumber coordinates')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

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

const getRelatedProducts = async (
  productId: string,
  filters: any = {},
): Promise<PaginatedResult<IProduct>> => {
  const prod = await Product.findById(productId);
  if (!prod)
    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };

  const queryBuilder = new QueryBuilder(
    Product.find({
      _id: { $ne: prod._id },
      category: prod.category,
    }).populate('sellerId', 'name whatsappNumber coordinates'),
    filters,
  )
    .search(['name', 'description', 'brand', 'category'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [products, total] = await Promise.all([
    queryBuilder.modelQuery.exec(),
    queryBuilder.getPaginationInfo(),
  ]);

  return {
    data: products as unknown as IProduct[],
    meta: {
      total: total.total,
      page: total.page,
      limit: total.limit,
      totalPages: total.totalPage,
    },
  };
};

const getAdvancedProductsFromDB = async (
  filter: any = {},
): Promise<PaginatedResult<IProduct>> => {
  // Build base query
  const searchableFields = ['name', 'description', 'brand', 'category'];

  const queryBuilder = new QueryBuilder(
    Product.find({ isBlocked: false }).populate(
      'sellerId',
      'name whatsappNumber coordinates',
    ),
    filter,
  )
    .search(searchableFields)
    .filter()
    .priceRange()
    .locationRadius()
    .sort()
    .paginate()
    .fields();

  // Get products and total count
  const [products, total] = await Promise.all([
    queryBuilder.modelQuery.exec(),
    queryBuilder.getPaginationInfo(),
  ]);

  return {
    data: products as unknown as IProduct[],
    meta: {
      total: total.total,
      page: total.page,
      limit: total.limit,
      totalPages: total.totalPage,
    },
  };
};

const getMyProductsFromDB = async (
  sellerId: string,
  filters: any = {},
): Promise<PaginatedResult<IProduct>> => {
  const queryBuilder = new QueryBuilder(
    Product.find({ sellerId }).populate(
      'sellerId',
      'name whatsappNumber coordinates',
    ),
    filters,
  )
    .search(['name', 'description', 'brand', 'category'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [products, total] = await Promise.all([
    queryBuilder.modelQuery.exec(),
    queryBuilder.getPaginationInfo(),
  ]);

  return {
    data: products as unknown as IProduct[],
    meta: {
      total: total.total,
      page: total.page,
      limit: total.limit,
      totalPages: total.totalPage,
    },
  };
};

export const ProductService = {
  createProductToDB,
  updateProductToDB,
  deleteProductFromDB,
  getProductByIdFromDB,
  getProductsFromDB,
  getRelatedProducts,
  getAdvancedProductsFromDB,
  getMyProductsFromDB,
};
