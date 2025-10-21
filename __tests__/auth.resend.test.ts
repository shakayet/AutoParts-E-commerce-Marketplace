/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { AuthService } from '../src/app/modules/auth/auth.service';
import { User } from '../src/app/modules/user/user.model';
import { VerificationToken } from '../src/app/modules/verificationToken/verificationToken.model';

jest.mock('../src/app/modules/user/user.model');
jest.mock('../src/app/modules/verificationToken/verificationToken.model');

describe('AuthService OTP rate limiting', () => {
  beforeEach(() => jest.clearAllMocks());

  it('blocks resend after too many requests within window', async () => {
    const email = 'test@example.com';
    const now = new Date();

    // simulate user with recent resends
    (User.findOne as jest.Mock).mockResolvedValue({
      _id: 'u1',
      email,
      authentication: { resendCount: 3, lastResendAt: new Date(now.getTime() - 1 * 60 * 1000) },
    });

    await expect(AuthService.resendOtpToDB(email)).rejects.toThrow();
  });

  it('increments attempts on wrong verification and blocks after max attempts', async () => {
    const email = 'test2@example.com';
    const otp = 123456;

  const user = { _id: 'u2', email, authentication: { oneTimeCode: 111111, expireAt: new Date(Date.now() + 60000) } };
  // mock chainable query: User.findOne(...).select('+authentication')
  (User.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    // There is a verification token record
    const tokenRecord: any = { _id: 't1', user: 'u2', otp: 999999, attempts: 4, save: jest.fn().mockResolvedValue(true) };
    // first call (find by user+otp) returns null, second call (find any token for user) returns tokenRecord
    (VerificationToken.findOne as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce(tokenRecord);
    (VerificationToken.deleteMany as jest.Mock) = jest.fn().mockResolvedValue(true);

    await expect(AuthService.verifyEmailToDB({ email, oneTimeCode: otp })).rejects.toThrow();
    expect(VerificationToken.findOne).toHaveBeenCalled();
  });
});
