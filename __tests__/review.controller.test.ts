/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReviewController } from '../src/app/modules/review/review.controller';
import { ReviewService } from '../src/app/modules/review/review.service';

jest.mock('../src/app/modules/review/review.service');

describe('ReviewController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createReview calls service and returns created review', async () => {
    const mockReq: any = { user: { id: 'user1' }, body: { productId: 'p1', rating: 5, comment: 'Good' } };
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn(), locals: {} };

    (ReviewService.createReviewToDB as jest.Mock).mockResolvedValue({ _id: 'r1' });

  const mockNext = jest.fn();
  await ReviewController.createReview(mockReq, mockRes, mockNext);

    expect(ReviewService.createReviewToDB).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalled();
  });
});
