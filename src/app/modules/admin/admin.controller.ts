import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { AdminService } from './admin.service';

const getTopProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getTopProducts();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Top products retrieved successfully',
    data: result,
  });
});

const getCategorySummary = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getCategorySummary(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category summary retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getProducts(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Products retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.getProduct(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrieved successfully',
    data: result,
  });
});

export const AdminController = {
  getTopProducts,
  getCategorySummary,
  getProducts,
  getProduct,
};
