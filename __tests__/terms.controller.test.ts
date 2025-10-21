/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { TermsController } from '../src/app/modules/terms/terms.controller';
import { TermsService } from '../src/app/modules/terms/terms.service';

jest.mock('../src/app/modules/terms/terms.service');

describe('TermsController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getTerms sends data via sendResponse', async () => {
    const mockReq: any = {};
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    (TermsService.getTermsFromDB as jest.Mock).mockResolvedValue([{ _id: 't1' }]);

    await TermsController.getTerms(mockReq, mockRes, jest.fn());

    expect(TermsService.getTermsFromDB).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalled();
  });
});
