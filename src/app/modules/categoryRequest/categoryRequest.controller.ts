/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CategoryRequestService } from './categoryRequest.service';
import { StatusCodes } from 'http-status-codes';

const createCategoryRequest = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const userId =
      (user as any)?.id || (user as any)?._id || (user as any)?.userId;
    const payload = {
      name: req.body.name,
      description: req.body.description,
    };

    const result = await CategoryRequestService.createCategoryRequestToDB(
      userId,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Category request submitted',
      data: result,
    });
  },
);

const getCategoryRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryRequestService.getCategoryRequestsFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category requests retrieved',
    meta: result.meta,
    data: result.data,
  });
});

const reviewCategoryRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    const result = await CategoryRequestService.reviewCategoryRequestToDB(
      id,
      status,
      adminComment,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Category request reviewed',
      data: result,
    });
  },
);

const deleteCategoryRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await CategoryRequestService.deleteCategoryRequestFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category request deleted successfully',
  });
});

export const CategoryRequestController = {
  createCategoryRequest,
  getCategoryRequests,
  reviewCategoryRequest,
  deleteCategoryRequest,
};