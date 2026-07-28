"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const emailHelper_1 = require("../../../helpers/emailHelper");
const jwtHelper_1 = require("../../../helpers/jwtHelper");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const cryptoToken_1 = __importDefault(require("../../../util/cryptoToken"));
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const resetToken_model_1 = require("../resetToken/resetToken.model");
const user_model_1 = require("../user/user.model");
const user_service_1 = require("../user/user.service");
const verificationToken_model_1 = require("../verificationToken/verificationToken.model");
const createRefreshToken = (userId) => {
    return jwtHelper_1.jwtHelper.createToken({ id: userId }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expire_in);
};
const loginUserFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const isExistUser = yield user_model_1.User.findOne({ email }).select('+password');
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    //check verified and status
    if (!isExistUser.verified) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please verify your account, then try to login again');
    }
    //check user status
    if (isExistUser.status === 'banned') {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You don’t have permission to access this content.It looks like your account has been deactivated.');
    }
    //check match password
    if (password &&
        !(yield user_model_1.User.isMatchPassword(password, isExistUser.password))) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Password is incorrect!');
    }
    const createToken = jwtHelper_1.jwtHelper.createToken({ id: isExistUser._id, role: isExistUser.role, email: isExistUser.email }, config_1.default.jwt.jwt_secret, config_1.default.jwt.jwt_expire_in);
    const refreshToken = createRefreshToken(String(isExistUser._id));
    return { createToken, refreshToken };
});
//forget password
const forgetPasswordToDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.User.isExistUserByEmail(email);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    //send mail
    const otp = (0, generateOTP_1.default)();
    const value = {
        otp,
        email: isExistUser.email,
    };
    const forgetPassword = emailTemplate_1.emailTemplate.resetPassword(value);
    emailHelper_1.emailHelper.sendEmail(forgetPassword);
    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };
    yield user_model_1.User.findOneAndUpdate({ email }, { $set: { authentication } });
});
//verify email
const verifyEmailToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { email, oneTimeCode } = payload;
    const isExistUser = yield user_model_1.User.findOne({ email }).select('+authentication');
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    if (!oneTimeCode) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please give the otp, check your email we send a code');
    }
    // Try verification token first (separate collection)
    const verificationRecord = yield verificationToken_model_1.VerificationToken.findOne({
        user: isExistUser._id,
        otp: oneTimeCode,
    });
    const MAX_VERIFY_ATTEMPTS = 5;
    if (!verificationRecord) {
        // fallback to user.authentication
        if (((_a = isExistUser.authentication) === null || _a === void 0 ? void 0 : _a.oneTimeCode) !== oneTimeCode) {
            // increment attempts on any existing verification token for the user
            const anyToken = yield verificationToken_model_1.VerificationToken.findOne({
                user: isExistUser._id,
            });
            if (anyToken) {
                anyToken.attempts = (anyToken.attempts || 0) + 1;
                yield anyToken.save();
                if (anyToken.attempts >= MAX_VERIFY_ATTEMPTS) {
                    // remove tokens and clear authentication
                    yield verificationToken_model_1.VerificationToken.deleteMany({ user: isExistUser._id });
                    yield user_model_1.User.findByIdAndUpdate(isExistUser._id, {
                        $set: { authentication: { oneTimeCode: null, expireAt: null } },
                    });
                    throw new ApiError_1.default(http_status_codes_1.StatusCodes.TOO_MANY_REQUESTS, 'Too many verification attempts. Please request a new OTP.');
                }
            }
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You provided wrong otp');
        }
    }
    const date = new Date();
    const expireAt = verificationRecord
        ? verificationRecord.expireAt
        : (_b = isExistUser.authentication) === null || _b === void 0 ? void 0 : _b.expireAt;
    if (!expireAt || date > expireAt) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Otp already expired, Please try again');
    }
    let message;
    let data;
    if (!isExistUser.verified) {
        yield user_model_1.User.findOneAndUpdate({ _id: isExistUser._id }, { verified: true, authentication: { oneTimeCode: null, expireAt: null } });
        // remove verification token(s)
        yield verificationToken_model_1.VerificationToken.deleteMany({ user: isExistUser._id });
        message = 'Email verify successfully';
    }
    else {
        yield user_model_1.User.findOneAndUpdate({ _id: isExistUser._id }, {
            authentication: {
                isResetPassword: true,
                oneTimeCode: null,
                expireAt: null,
            },
        });
        //create token ;
        const createToken = (0, cryptoToken_1.default)();
        yield resetToken_model_1.ResetToken.create({
            user: isExistUser._id,
            token: createToken,
            expireAt: new Date(Date.now() + 5 * 60000),
        });
        // remove any verification tokens to avoid reuse/confusion
        yield verificationToken_model_1.VerificationToken.deleteMany({ user: isExistUser._id });
        message =
            'Verification Successful: Please securely store and utilize this code for reset password';
        data = createToken;
    }
    return { data, message };
});
//forget password
const resetPasswordToDB = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { newPassword, confirmPassword } = payload;
    if (!token) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Reset token is required');
    }
    //isExist token
    const isExistToken = yield resetToken_model_1.ResetToken.isExistToken(token);
    if (!isExistToken) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized');
    }
    //user permission check
    const isExistUser = yield user_model_1.User.findById(isExistToken.user).select('+authentication');
    if (!((_a = isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.authentication) === null || _a === void 0 ? void 0 : _a.isResetPassword)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "You don't have permission to change the password. Please click again to 'Forgot Password'");
    }
    //validity check
    const isValid = yield resetToken_model_1.ResetToken.isExpireToken(token);
    if (!isValid) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Token expired, Please click again to the forget password');
    }
    //check password
    if (newPassword !== confirmPassword) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "New password and Confirm password doesn't match!");
    }
    const hashPassword = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    const updateData = {
        password: hashPassword,
        authentication: {
            isResetPassword: false,
        },
    };
    yield user_model_1.User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
        new: true,
    });
    // remove the used reset token so it cannot be reused
    yield resetToken_model_1.ResetToken.deleteMany({ token });
});
const changePasswordToDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { currentPassword, newPassword, confirmPassword } = payload;
    const isExistUser = yield user_model_1.User.findById(user.id).select('+password');
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    //current password match
    if (currentPassword &&
        !(yield user_model_1.User.isMatchPassword(currentPassword, isExistUser.password))) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Password is incorrect');
    }
    //newPassword and current password
    if (currentPassword === newPassword) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please give different password from current password');
    }
    //new password and confirm password check
    if (newPassword !== confirmPassword) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Password and Confirm password doesn't matched");
    }
    //hash password
    const hashPassword = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    const updateData = {
        password: hashPassword,
    };
    yield user_model_1.User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
});
const refreshTokenToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = payload;
    if (!refreshToken) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Refresh token is required');
    }
    let decoded;
    try {
        decoded = jwtHelper_1.jwtHelper.verifyToken(refreshToken, config_1.default.jwt.refresh_secret);
    }
    catch (_a) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
    }
    const userId = decoded.id;
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'User not found');
    }
    if (user.status === 'banned') {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Account is deactivated. Please contact support');
    }
    const createToken = jwtHelper_1.jwtHelper.createToken({ id: user._id, role: user.role, email: user.email }, config_1.default.jwt.jwt_secret, config_1.default.jwt.jwt_expire_in);
    const newRefreshToken = createRefreshToken(String(user._id));
    return { createToken, refreshToken: newRefreshToken };
});
const logoutFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = payload;
    if (!refreshToken) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Refresh token is required');
    }
    try {
        jwtHelper_1.jwtHelper.verifyToken(refreshToken, config_1.default.jwt.refresh_secret);
    }
    catch (_a) {
        // if token is invalid/expired, treat as already logged out
    }
});
// resend otp
const resendOtpToDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.User.findOne({ email });
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    // rate limit: allow max 3 resends per 15 minutes
    const MAX_RESENDS = 3;
    const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
    const now = new Date();
    const auth = isExistUser.authentication ||
        { resendCount: 0, lastResendAt: null };
    if (auth.lastResendAt &&
        now.getTime() - new Date(auth.lastResendAt).getTime() < WINDOW_MS) {
        if ((auth.resendCount || 0) >= MAX_RESENDS) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.TOO_MANY_REQUESTS, 'Too many OTP requests. Please try again later');
        }
    }
    else {
        // reset window
        auth.resendCount = 0;
    }
    //generate new otp
    const otp = (0, generateOTP_1.default)();
    const values = {
        name: isExistUser.name,
        otp,
        email: isExistUser.email,
    };
    const resendTemplate = emailTemplate_1.emailTemplate.createAccount(values);
    emailHelper_1.emailHelper.sendEmail(resendTemplate);
    //save otp to DB
    auth.oneTimeCode = otp;
    auth.expireAt = new Date(Date.now() + 3 * 60000);
    auth.lastResendAt = now;
    auth.resendCount = (auth.resendCount || 0) + 1;
    yield user_model_1.User.findOneAndUpdate({ _id: isExistUser._id }, { $set: { authentication: auth } });
    // create verification token record
    yield verificationToken_model_1.VerificationToken.create({
        user: isExistUser._id,
        otp,
        expireAt: new Date(Date.now() + 3 * 60000),
        attempts: 0,
    });
    return { message: 'OTP resent successfully, please check your email' };
});
// register user
const registerUserFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // delegate to UserService to keep logic consistent
    const result = yield user_service_1.UserService.createUserToDB(payload);
    // create verification token record for OTP (mirror to spec)
    const otp = result.otp;
    yield verificationToken_model_1.VerificationToken.create({
        user: result.user._id,
        otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    });
    return result.user;
});
exports.AuthService = {
    verifyEmailToDB,
    loginUserFromDB,
    forgetPasswordToDB,
    resetPasswordToDB,
    changePasswordToDB,
    resendOtpToDB,
    registerUserFromDB,
    refreshTokenToDB,
    logoutFromDB,
};
