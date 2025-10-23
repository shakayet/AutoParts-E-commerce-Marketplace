/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FAQService } from './faq.service';
import { StatusCodes } from 'http-status-codes';
import { Express } from 'express';
import { getSingleFilePath } from '../../../shared/getFilePath';

type MulterFile = Express.Multer.File;

const createFAQ = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files as any, 'image');
  const data = {
    image,
    ...req.body,
  };

  const result = await FAQService.createFAQToDB(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'FAQ created successfully',
    data: result,
  });
});

const updateFAQ = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const image = getSingleFilePath(req.files as any, 'image');
  const data = {
    image,
    ...req.body,
  };

  const result = await FAQService.updateFAQToDB(id, data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'FAQ updated successfully',
    data: result,
  });
});

const deleteFAQ = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await FAQService.deleteFAQFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'FAQ deleted successfully',
  });
});

const getFAQs = catchAsync(async (req: Request, res: Response) => {
  const result = await FAQService.getFAQsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'FAQs retrieved successfully',
    data: result,
  });
});

export const FAQController = { createFAQ, updateFAQ, deleteFAQ, getFAQs };
