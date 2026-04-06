/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Product } from './product.model';
import StorageService from '../../services/storage.service';
import { IProduct } from './product.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { FilterQuery } from 'mongoose';

type PaginatedResult<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

const createProductToDB = async (
  payload: Partial<IProduct>,
): Promise<IProduct> => {
  const sellerId = payload.sellerId as string | undefined;
  if (!sellerId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Seller not specified');
  }

  const seller = await User.findById(sellerId);
  if (!seller) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Seller not found');
  }

  const lat = seller.coordinates?.lat;
  const lng = seller.coordinates?.lng;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Seller location is not set. Please update your profile location first',
    );
  }

  const doc: any = {
    ...payload,
    coordinates: {
      type: 'Point',
      coordinates: [lng, lat],
    },
  };

  const product = await Product.create(doc);
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
  filters: any = {},
): Promise<PaginatedResult<IProduct>> => {
  const { userLat, userLng, radius, ...restFilters } = filters;

  const baseQuery: FilterQuery<IProduct> = { isBlocked: false };

  if (userLat && userLng) {
    baseQuery.coordinates = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(userLng), parseFloat(userLat)],
        },
        ...(radius && { $maxDistance: parseFloat(radius) * 1000 }),
      },
    };
  }

  delete restFilters.lat;
  delete restFilters.lng;
  delete restFilters.radius;

  const queryBuilder = new QueryBuilder(
    Product.find(baseQuery).populate(
      'sellerId',
      'name whatsappNumber coordinates',
    ),
    restFilters,
  )
    .search(['title', 'description', 'brand', 'category'])
    .filter()
    .priceRange()
    .locationRadius();

  if (!(userLat && userLng)) {
    queryBuilder.sort();
  }

  queryBuilder.paginate().fields();

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

const searchProductsFromDB = async (
  query: Record<string, unknown>,
): Promise<PaginatedResult<IProduct>> => {
  const { searchTerm, category, title, carModels, brand, ...restFilters } =
    query;

  const baseQuery: FilterQuery<IProduct> = { isBlocked: false };

  // Initialize filters with any remaining query parameters
  const filters: Record<string, any> = { ...restFilters };

  // Add case-insensitive partial matching for specified fields
  if (category) {
    filters.category = { $regex: category, $options: 'i' };
  }
  if (title) {
    filters.title = { $regex: title, $options: 'i' };
  }
  if (brand) {
    filters.brand = { $regex: brand, $options: 'i' };
  }
  if (carModels) {
    filters.carModels = { $regex: carModels, $options: 'i' };
  }

  // Use QueryBuilder for handling search, filtering, sorting, and pagination
  const queryBuilder = new QueryBuilder(
    Product.find(baseQuery).populate(
      'sellerId',
      'name whatsappNumber coordinates',
    ),
    { ...filters, searchTerm },
  )
    .search(['title', 'description', 'brand', 'category'])
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
    .search(['title', 'description', 'brand', 'category'])
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
    .search(['title', 'description', 'brand', 'category'])
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
  getMyProductsFromDB,
  searchProductsFromDB,
};
