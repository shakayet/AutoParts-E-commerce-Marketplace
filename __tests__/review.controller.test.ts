/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReviewController } from '../src/app/modules/review/review.controller';
import { ReviewService } from '../src/app/modules/review/review.service';
import { Review } from '../src/app/modules/review/review.model';
import { Product } from '../src/app/modules/product/product.model';

jest.mock('../src/app/modules/review/review.service');

describe('ReviewController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createReview calls service and returns created review', async () => {
    const mockReq: any = {
      user: { id: 'user1' },
      body: { productId: 'p1', rating: 5, comment: 'Good' },
    };
    const mockRes: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {},
    };

    (ReviewService.createReviewToDB as jest.Mock).mockResolvedValue({
      _id: 'r1',
    });

    // stub mongoose static methods used inside controller
    (Review.find as jest.Mock) = jest
      .fn()
      .mockReturnValue({ sort: jest.fn().mockResolvedValue([{ rating: 5 }]) });
    (Product.findByIdAndUpdate as jest.Mock) = jest.fn().mockResolvedValue({});

    const mockNext = jest.fn();
    await ReviewController.createReview(mockReq, mockRes, mockNext);

    expect(ReviewService.createReviewToDB).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalled();
  });
});
