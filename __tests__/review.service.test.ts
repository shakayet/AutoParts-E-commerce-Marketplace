/* eslint-disable no-undef */
import { ReviewService } from '../src/app/modules/review/review.service';
import { Review } from '../src/app/modules/review/review.model';
import { Product } from '../src/app/modules/product/product.model';
import { Notification } from '../src/app/modules/notification/notification.model';

jest.mock('../src/app/modules/review/review.model');
jest.mock('../src/app/modules/product/product.model');
jest.mock('../src/app/modules/notification/notification.model');

describe('ReviewService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a review, updates product ratings, and creates notification', async () => {
    const userId = 'user123';
    const productId = 'prod123';

    // mock Product.findById
    (Product.findById as jest.Mock).mockResolvedValue({
      _id: productId,
      averageRating: 4,
      totalRatings: 1,
      sellerId: 'seller1',
      save: jest.fn().mockResolvedValue(true),
    });

    (Review.findOne as jest.Mock).mockResolvedValue(null);
    (Review.create as jest.Mock).mockResolvedValue({ _id: 'rev1', productId, userId, rating: 5, comment: 'Nice' });
    (Notification.create as jest.Mock).mockResolvedValue({ _id: 'n1' });

    const result = await ReviewService.createReviewToDB(userId, { productId, rating: 5, comment: 'Nice' });

    expect(Review.findOne).toHaveBeenCalledWith({ productId, userId });
    expect(Review.create).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalled();
    expect(result).toHaveProperty('_id', 'rev1');
  });

  it('prevents duplicate reviews by same user', async () => {
    const userId = 'user123';
    const productId = 'prod123';

    (Product.findById as jest.Mock).mockResolvedValue({ _id: productId });
    (Review.findOne as jest.Mock).mockResolvedValue({ _id: 'existing' });

    await expect(ReviewService.createReviewToDB(userId, { productId, rating: 5 })).rejects.toThrow();
  });
});
