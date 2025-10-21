import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FAQService } from './faq.service';
import { StatusCodes } from 'http-status-codes';

const createFAQ = catchAsync(async (req: Request, res: Response) => {
  const result = await FAQService.createFAQToDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'FAQ created successfully',
    data: result,
  });
});

const updateFAQ = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FAQService.updateFAQToDB(id, req.body);
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
