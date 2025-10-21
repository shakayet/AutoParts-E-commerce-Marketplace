/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { FAQController } from '../src/app/modules/faq/faq.controller';
import { FAQService } from '../src/app/modules/faq/faq.service';

jest.mock('../src/app/modules/faq/faq.service');

describe('FAQController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getFAQs returns data via sendResponse', async () => {
    const mockReq: any = {};
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    (FAQService.getFAQsFromDB as jest.Mock).mockResolvedValue([{ _id: 'f1' }]);

    await FAQController.getFAQs(mockReq, mockRes, jest.fn());

    expect(FAQService.getFAQsFromDB).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalled();
  });
});
