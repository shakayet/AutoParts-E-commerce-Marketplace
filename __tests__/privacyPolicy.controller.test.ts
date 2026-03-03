/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { PrivacyPolicyController } from '../src/app/modules/privacyPolicy/privacyPolicy.controller';
import { PrivacyPolicyService } from '../src/app/modules/privacyPolicy/privacyPolicy.service';

jest.mock('../src/app/modules/privacyPolicy/privacyPolicy.service');

describe('PrivacyPolicyController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getPrivacyPolicies sends data via sendResponse', async () => {
    const mockReq: any = {};
    const mockRes: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    (
      PrivacyPolicyService.getPrivacyPoliciesFromDB as jest.Mock
    ).mockResolvedValue([{ _id: 'p1' }]);

    await PrivacyPolicyController.getPrivacyPolicies(
      mockReq,
      mockRes,
      jest.fn(),
    );

    expect(PrivacyPolicyService.getPrivacyPoliciesFromDB).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalled();
  });
});
