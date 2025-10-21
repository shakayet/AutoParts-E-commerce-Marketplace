import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SellerService } from './seller.service';
import { StatusCodes } from 'http-status-codes';

const getSellerLocationLink = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SellerService.getSellerLocationLinkFromDB(id);
  sendResponse(res, { success: true, statusCode: StatusCodes.OK, message: 'Seller location retrieved', data: result });
});

export const SellerController = { getSellerLocationLink }; 
