/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { IProduct } from './product.interface';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ProductService } from './product.service';

type MulterFile = { fieldname: string; originalname: string; filename: string; mimetype: string };

const createProduct = catchAsync(async (req: Request, res: Response) => {
  // files handled by middleware
  const files = req.files as Record<string, MulterFile[] | undefined> | undefined;
  const images = files?.image ?? [];

  const mainImage = images.length > 0 ? `/${'image'}/${images[0].filename}` : undefined;
  const galleryImages = images.length > 1 ? images.slice(1, 6).map((f: MulterFile) => `/${'image'}/${f.filename}`) : undefined;

  const body = req.body as Partial<IProduct>;
  const payload: Partial<IProduct> = { ...body, mainImage, galleryImages, sellerName: req.user?.name };
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
  const files = req.files as Record<string, MulterFile[] | undefined> | undefined;
  const images = files?.image ?? [];

  const mainImage = images.length > 0 ? `/${'image'}/${images[0].filename}` : undefined;
  const galleryImages = images.length > 1 ? images.slice(1, 6).map((f: MulterFile) => `/${'image'}/${f.filename}`) : undefined;

  const body = req.body as Partial<IProduct>;
  const payload: Partial<IProduct> = { ...body };
  if (mainImage) payload.mainImage = mainImage;
  if (galleryImages) payload.galleryImages = galleryImages;

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

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrieved successfully',
    data: result,
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

const getRelatedProducts = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.getRelatedProducts(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Related products retrieved successfully',
    data: result,
  });
});

export const ProductController = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getRelatedProducts,
};
