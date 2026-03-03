/* eslint-disable no-undef */
import { PrivacyPolicyService } from '../src/app/modules/privacyPolicy/privacyPolicy.service';
import { PrivacyPolicy } from '../src/app/modules/privacyPolicy/privacyPolicy.model';

jest.mock('../src/app/modules/privacyPolicy/privacyPolicy.model');

describe('PrivacyPolicyService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createPrivacyPolicyToDB calls PrivacyPolicy.create', async () => {
    const payload = { content: 'P' };
    (PrivacyPolicy.create as jest.Mock).mockResolvedValue({
      _id: 'p1',
      ...payload,
    });

    const res = await PrivacyPolicyService.createPrivacyPolicyToDB(payload);
    expect(PrivacyPolicy.create).toHaveBeenCalledWith(payload);
    expect(res).toEqual(expect.objectContaining({ _id: 'p1' }));
  });

  it('getPrivacyPoliciesFromDB returns active policies', async () => {
    const docs = [{ _id: 'p1' }];
    (PrivacyPolicy.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockResolvedValue(docs),
    });

    const res = await PrivacyPolicyService.getPrivacyPoliciesFromDB();
    expect(PrivacyPolicy.find).toHaveBeenCalledWith({ isActive: true });
    expect(res).toEqual(docs);
  });
});
