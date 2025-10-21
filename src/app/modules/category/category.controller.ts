/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CategoryService } from './category.service';
import { StatusCodes } from 'http-status-codes';

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategoryToDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Category created successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryService.updateCategoryToDB(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category updated successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await CategoryService.deleteCategoryFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category deleted successfully',
  });
});

const getCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategoriesFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Categories retrieved successfully',
    data: result,
  });
});

// requests
const createCategoryRequest = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId;
  const result = await CategoryService.createCategoryRequestToDB(userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Category request submitted',
    data: result,
  });
});

const getCategoryRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategoryRequestsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category requests retrieved',
    data: result,
  });
});

const reviewCategoryRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminComment } = req.body;
  const result = await CategoryService.reviewCategoryRequestToDB(id, status, adminComment);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category request reviewed',
    data: result,
  });
});

export const CategoryController = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  createCategoryRequest,
  getCategoryRequests,
  reviewCategoryRequest,
};
