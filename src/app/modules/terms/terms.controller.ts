import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TermsService } from './terms.service';
import { StatusCodes } from 'http-status-codes';

const createTerms = catchAsync(async (req: Request, res: Response) => {
  const result = await TermsService.createTermsToDB(req.body);
  sendResponse(res, { success: true, statusCode: StatusCodes.CREATED, message: 'Terms created', data: result });
});

const updateTerms = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TermsService.updateTermsToDB(id, req.body);
  sendResponse(res, { success: true, statusCode: StatusCodes.OK, message: 'Terms updated', data: result });
});

const deleteTerms = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await TermsService.deleteTermsFromDB(id);
  sendResponse(res, { success: true, statusCode: StatusCodes.OK, message: 'Terms deleted' });
});

const getTerms = catchAsync(async (req: Request, res: Response) => {
  const result = await TermsService.getTermsFromDB();
  sendResponse(res, { success: true, statusCode: StatusCodes.OK, message: 'Terms retrieved', data: result });
});

export const TermsController = { createTerms, updateTerms, deleteTerms, getTerms };
