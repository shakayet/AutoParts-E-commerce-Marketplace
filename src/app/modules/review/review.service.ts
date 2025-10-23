/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { Review } from './review.model';
import { Product } from '../product/product.model';
import { Notification } from '../notification/notification.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const createReviewToDB = async (
  userId: string,
  payload: { productId: string; rating: number; comment?: string }
) => {
  const { productId, rating, comment } = payload;

  // ensure product exists
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');

  // ensure user hasn't already reviewed
  const existing = await Review.findOne({ productId, userId });
  if (existing)
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You have already reviewed this product'
    );

  // create review
  const review = await Review.create({ productId, userId, rating, comment });

  // update product avg rating and totalRatings
  const totalRatings = (product.totalRatings || 0) + 1;
  const totalRatingScore =
    (product.averageRating || 0) * (product.totalRatings || 0) + rating;
  const averageRating = totalRatingScore / totalRatings;

  product.averageRating = averageRating;
  product.totalRatings = totalRatings;
  await product.save();

  // create notification for seller
  const notification = await Notification.create({
    user: product.sellerId as unknown as string,
    type: 'NEW_REVIEW',
    data: { productId, reviewId: review._id, rating, comment, from: userId },
  });

  // emit socket event globally (if available)
  try {
    const io = (global as any).io;
    if (io) io.to(product.sellerId.toString()).emit('NEW_REVIEW', notification);
  } catch (err) {
    console.error('Error emitting NEW_REVIEW event:', err);
  }

  return review;
};

const getReviewsForProduct = async (productId: string) => {
  const reviews = await Review.find({ productId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
  return reviews;
};

const deleteReview = async (reviewId: string, userId: string) => {
  const rev = await Review.findOne({ _id: reviewId, userId });
  if (!rev) throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found');

  const product = await Product.findById(rev.productId);
  if (product) {
    const totalRatings = Math.max(0, (product.totalRatings || 1) - 1);
    const totalRatingScore =
      (product.averageRating || 0) * (product.totalRatings || 0) - rev.rating;
    const averageRating =
      totalRatings === 0 ? 0 : totalRatingScore / totalRatings;
    product.averageRating = averageRating;
    product.totalRatings = totalRatings;
    await product.save();
  }

  await Review.deleteOne({ _id: reviewId });
};

export const ReviewService = {
  createReviewToDB,
  getReviewsForProduct,
  deleteReview,
};
