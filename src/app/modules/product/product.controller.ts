/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { IProduct } from './product.interface';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ProductService } from './product.service';
import { Express } from 'express';
import { Product } from './product.model';

type MulterFile = Express.Multer.File;

interface MulterRequest extends Request {
  files: {
    mainImage?: MulterFile[];
    galleryImages?: MulterFile[];
  };
}

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const { mainImage: a, galleryImages: b } = (req as MulterRequest).files;

  const mainImage =
    a && a.length > 0
      ? (a[0] as any).url || `/${'image'}/${a[0].filename}`
      : undefined;

  const galleryImages =
    b && b.length > 0
      ? b.map((f: any) => f.url || `/${'image'}/${f.filename}`)
      : undefined;

  const body = req.body as Partial<IProduct>;
  const payload: Partial<IProduct> = {
    ...body,
    mainImage,
    galleryImages,
    sellerId: req.user?.id,
  };

  const result = await ProductService.createProductToDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Product created successfully',
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // 1. Extract files from the correct fields
  const files = req.files as any;
  const mainImageFiles = files?.mainImage || [];
  const newGalleryFiles = files?.galleryImages || [];

  // 2. Parse new URLs if files were uploaded
  const newMainImage =
    mainImageFiles.length > 0
      ? mainImageFiles[0].url || `/${'image'}/${mainImageFiles[0].filename}`
      : undefined;

  const newGalleryUrls = newGalleryFiles.map(
    (f: any) => f.url || `/${'image'}/${f.filename}`,
  );

  // 3. Extract the body (contains existing gallery URLs to keep)
  const body = req.body as Partial<IProduct>;
  const payload: Partial<IProduct> = { ...body };

  // 4. Update mainImage if a new one was uploaded
  if (newMainImage) {
    payload.mainImage = newMainImage;
  }

  // 5. Merge existing gallery URLs with the newly uploaded ones
  // body.galleryImages contains the URLs the user decided to KEEP
  const existingGalleryUrls = Array.isArray(body.galleryImages)
    ? body.galleryImages
    : [];

  // If there are new files OR we are explicitly modifying the gallery
  if (newGalleryUrls.length > 0 || body.galleryImages) {
    payload.galleryImages = [...existingGalleryUrls, ...newGalleryUrls];
  }

  const result = await ProductService.updateProductToDB(id, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product updated successfully',
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ProductService.deleteProductFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product deleted successfully',
  });
});

const getProductById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.getProductByIdFromDB(id);

  if (!result) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.NOT_FOUND,
      message: 'Product not found',
      data: null,
    });
  }

  // Calculate seller rating (corrected logic)
  const { sellerId } = result;
  const allProducts = await Product.find({ sellerId });

  let sellerRating = 0;
  if (allProducts.length > 0) {
    const totalRatingsSum = allProducts.reduce(
      (sum, product) =>
        sum + (product.averageRating || 0) * (product.totalRatings || 0),
      0,
    );

    const totalRatingsCount = allProducts.reduce(
      (sum, product) => sum + (product.totalRatings || 0),
      0,
    );

    sellerRating =
      totalRatingsCount > 0 ? totalRatingsSum / totalRatingsCount : 0;
  }

  // Add sellerRating to the response without saving to DB
  const responseData = {
    ...(result as any).toObject(),
    sellerRating: Number(sellerRating.toFixed(2)),
  };

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrieved successfully',
    data: responseData,
  });
});

const getProducts = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query;
  const result = await ProductService.getProductsFromDB(filters);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Products retrieved successfully',
    data: result.data,
    pagination: {
      page: result.meta.page,
      limit: result.meta.limit,
      totalPage: result.meta.totalPages,
      total: result.meta.total,
    },
  });
});

const searchProducts = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ProductService.searchProductsFromDB(query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Products searched successfully',
    data: result.data,
    pagination: {
      page: result.meta.page,
      limit: result.meta.limit,
      totalPage: result.meta.totalPages,
      total: result.meta.total,
    },
  });
});

const getRelatedProducts = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const filters = req.query;
  const result = await ProductService.getRelatedProducts(id, filters);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Related products retrieved successfully',
    data: result.data,
    pagination: {
      page: result.meta.page,
      limit: result.meta.limit,
      totalPage: result.meta.totalPages,
      total: result.meta.total,
    },
  });
});

const getMyProducts = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query;
  const result = await ProductService.getMyProductsFromDB(
    req.user?.id,
    filters,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'My products retrieved successfully',
    data: result.data,
    pagination: {
      page: result.meta.page,
      limit: result.meta.limit,
      totalPage: result.meta.totalPages,
      total: result.meta.total,
    },
  });
});

export const ProductController = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getRelatedProducts,
  getMyProducts,
  searchProducts,
};
