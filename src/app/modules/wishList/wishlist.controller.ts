import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { WishlistService } from './wishlist.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id; 
  const { productId } = req.body;

  const result = await WishlistService.addToWishlist(userId, productId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Product added to wishlist successfully',
    data: result,
  });
});

const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await WishlistService.getWishlist(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Wishlist retrieved successfully',
    data: result,
  });
});

const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const result = await WishlistService.removeFromWishlist(userId, productId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product removed from wishlist successfully',
    data: result,
  });
});

export const WishlistController = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
