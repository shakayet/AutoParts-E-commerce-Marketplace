/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { SellerController } from '../src/app/modules/seller/seller.controller';
import { SellerService } from '../src/app/modules/seller/seller.service';

jest.mock('../src/app/modules/seller/seller.service');

describe('SellerController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getSellerLocationLink returns data via sendResponse', async () => {
    const mockReq: any = { params: { id: 'u1' } };
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    (SellerService.getSellerLocationLinkFromDB as jest.Mock).mockResolvedValue({ url: 'u' });

    await SellerController.getSellerLocationLink(mockReq, mockRes, jest.fn());

    expect(SellerService.getSellerLocationLinkFromDB).toHaveBeenCalledWith('u1');
    expect(mockRes.status).toHaveBeenCalled();
  });
});
