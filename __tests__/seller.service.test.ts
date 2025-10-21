/* eslint-disable no-undef */
import { SellerService } from '../src/app/modules/seller/seller.service';
import { User } from '../src/app/modules/user/user.model';

jest.mock('../src/app/modules/user/user.model');

describe('SellerService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns google maps url when coordinates exist', async () => {
  (User.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue({ coordinates: { lat: 1.23, lng: 4.56 } }) });

    const res = await SellerService.getSellerLocationLinkFromDB('u1');
    expect(User.findById).toHaveBeenCalledWith('u1');
    expect(res.url).toContain('https://www.google.com/maps/search/');
  });

  it('throws when user not found', async () => {
  (User.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await expect(SellerService.getSellerLocationLinkFromDB('u2')).rejects.toThrow();
  });
});
