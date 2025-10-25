/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReviewService } from './review.service';
import { Review } from './review.model';
import { Product } from '../product/product.model';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { id: string };
  const { productId, rating, comment } = req.body;
  const result = await ReviewService.createReviewToDB(user.id, {
    productId,
    rating: Number(rating),
    comment,
  });

  const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    if (!reviews.length) {
      return res.status(404).json({ success: false, message: 'No reviews found for this product' });
    }

    const averageRating =
      reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length;

  await Product.findByIdAndUpdate(productId, {
      averageRating: Number(averageRating.toFixed(2)),
      ratingsCount: reviews.length,
    });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Review created successfully',
    data: result,
  });
});

const getReviews = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const result = await ReviewService.getReviewsForProduct(productId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { id: string };
  const { id } = req.params;
  await ReviewService.deleteReview(id, user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Review deleted successfully',
  });
});

const getSingleProductReview = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    if (!reviews.length) {
      return res.status(404).json({ success: false, message: 'No reviews found for this product' });
    }

    const averageRating =
      reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length;

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: Number(averageRating.toFixed(2)),
      data: reviews,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product reviews',
    });
  }
};

export const ReviewController = {
  createReview,
  getReviews,
  deleteReview,
  getSingleProductReview,
};
