/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../types/auth';
import cryptoToken from '../../../util/cryptoToken';
import generateOTP from '../../../util/generateOTP';
import { ResetToken } from '../resetToken/resetToken.model';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { VerificationToken } from '../verificationToken/verificationToken.model';

//login
const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;
  const isExistUser = await User.findOne({ email }).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //check verified and status
  if (!isExistUser.verified) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account, then try to login again'
    );
  }

  //check user status
  if (isExistUser.status === 'delete') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You don’t have permission to access this content.It looks like your account has been deactivated.'
    );
  }

  //check match password
  if (
    password &&
    !(await User.isMatchPassword(password, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  //create token
  const createToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return { createToken };
};

//forget password
const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: isExistUser.email,
  };
  const forgetPassword = emailTemplate.resetPassword(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate({ email }, { $set: { authentication } });
};

//verify email
const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;
  const isExistUser = await User.findOne({ email }).select('+authentication');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give the otp, check your email we send a code'
    );
  }

  // Try verification token first (separate collection)
  const verificationRecord = await VerificationToken.findOne({ user: isExistUser._id, otp: oneTimeCode });

  const MAX_VERIFY_ATTEMPTS = 5;

  if (!verificationRecord) {
    // fallback to user.authentication
    if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
      // increment attempts on any existing verification token for the user
      const anyToken = await VerificationToken.findOne({ user: isExistUser._id });
      if (anyToken) {
        anyToken.attempts = (anyToken.attempts || 0) + 1;
        await anyToken.save();
        if (anyToken.attempts >= MAX_VERIFY_ATTEMPTS) {
          // remove tokens and clear authentication
          await VerificationToken.deleteMany({ user: isExistUser._id });
          await User.findByIdAndUpdate(isExistUser._id, { $set: { authentication: { oneTimeCode: null, expireAt: null } } });
          throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Too many verification attempts. Please request a new OTP.');
        }
      }
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
    }
  }

  const date = new Date();
  const expireAt = verificationRecord ? verificationRecord.expireAt : isExistUser.authentication?.expireAt;
  if (!expireAt || date > expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Otp already expired, Please try again'
    );
  }

  let message;
  let data;

  if (!isExistUser.verified) {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      { verified: true, authentication: { oneTimeCode: null, expireAt: null } }
    );
    // remove verification token(s)
    await VerificationToken.deleteMany({ user: isExistUser._id });
    message = 'Email verify successfully';
  } else {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        authentication: {
          isResetPassword: true,
          oneTimeCode: null,
          expireAt: null,
        },
      }
    );

    //create token ;
    const createToken = cryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: createToken,
      expireAt: new Date(Date.now() + 5 * 60000),
    });
    // remove any verification tokens to avoid reuse/confusion
    await VerificationToken.deleteMany({ user: isExistUser._id });
    message =
      'Verification Successful: Please securely store and utilize this code for reset password';
    data = createToken;
  }
  return { data, message };
};

//forget password
const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;
  if (!token) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Reset token is required');
  }

  //isExist token
  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  //user permission check
  const isExistUser = await User.findById(isExistToken.user).select(
    '+authentication'
  );
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'"
    );
  }

  //validity check
  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Token expired, Please click again to the forget password'
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
    authentication: {
      isResetPassword: false,
    },
  };

  await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  });
  // remove the used reset token so it cannot be reused
  await ResetToken.deleteMany({ token });
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await User.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
  };
  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};


// resend otp
const resendOtpToDB = async (email: string) => {
  const isExistUser = await User.findOne({ email });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  // rate limit: allow max 3 resends per 15 minutes
  const MAX_RESENDS = 3;
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const now = new Date();
  const auth = isExistUser.authentication || { resendCount: 0, lastResendAt: null } as any;
  if (auth.lastResendAt && now.getTime() - new Date(auth.lastResendAt).getTime() < WINDOW_MS) {
    if ((auth.resendCount || 0) >= MAX_RESENDS) {
      throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Too many OTP requests. Please try again later');
    }
  } else {
    // reset window
    auth.resendCount = 0;
  }

  //generate new otp
  const otp = generateOTP();
  const values = {
    name: isExistUser.name,
    otp,
    email: isExistUser.email!,
  };

  const resendTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(resendTemplate);

  //save otp to DB
  auth.oneTimeCode = otp;
  auth.expireAt = new Date(Date.now() + 3 * 60000);
  auth.lastResendAt = now;
  auth.resendCount = (auth.resendCount || 0) + 1;

  await User.findOneAndUpdate({ _id: isExistUser._id }, { $set: { authentication: auth } });

  // create verification token record
  await VerificationToken.create({
    user: isExistUser._id,
    otp,
    expireAt: new Date(Date.now() + 3 * 60000),
    attempts: 0,
  });

  return { message: 'OTP resent successfully, please check your email' };
};

// register user
const registerUserFromDB = async (payload: any) => {
  // delegate to UserService to keep logic consistent
  const result = await UserService.createUserToDB(payload);

  // create verification token record for OTP (mirror to spec)
  const otp = result.otp;
  await VerificationToken.create({
    user: (result.user as any)._id,
    otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  });

  return result.user;
};

export const AuthService = {
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  resendOtpToDB,
  registerUserFromDB,
};
