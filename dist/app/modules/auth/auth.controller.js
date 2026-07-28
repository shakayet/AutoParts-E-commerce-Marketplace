"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const auth_service_1 = require("./auth.service");
// import { JwtPayload } from 'jsonwebtoken';
const verifyEmail = (0, catchAsync_1.default)(async (req, res) => {
    const { ...verifyData } = req.body;
    const result = await auth_service_1.AuthService.verifyEmailToDB(verifyData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});
const registerUser = (0, catchAsync_1.default)(async (req, res) => {
    const { ...userData } = req.body;
    const result = await auth_service_1.AuthService.registerUserFromDB(userData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: 'User registered successfully. Please check your email for OTP',
        data: result,
    });
});
const loginUser = (0, catchAsync_1.default)(async (req, res) => {
    const { ...loginData } = req.body;
    const result = await auth_service_1.AuthService.loginUserFromDB(loginData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'User logged in successfully.',
        data: {
            accessToken: result.createToken,
            refreshToken: result.refreshToken,
        },
    });
});
const forgetPassword = (0, catchAsync_1.default)(async (req, res) => {
    const email = req.body.email;
    const result = await auth_service_1.AuthService.forgetPasswordToDB(email);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Please check your email. We have sent you a one-time passcode (OTP).',
        data: result,
    });
});
const resendOtp = async (req, res) => {
    try {
        const email = req.body.email;
        const result = await auth_service_1.AuthService.resendOtpToDB(email);
        res.status(200).json({ success: true, message: result.message });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        res.status(400).json({ success: false, message });
    }
};
const resetPassword = (0, catchAsync_1.default)(async (req, res) => {
    const authHeader = req.headers.authorization;
    let token = authHeader;
    if (authHeader && authHeader.startsWith('Bearer '))
        token = authHeader.split(' ')[1];
    const { ...resetData } = req.body;
    const result = await auth_service_1.AuthService.resetPasswordToDB(token, resetData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Your password has been successfully reset.',
        data: result,
    });
});
const changePassword = (0, catchAsync_1.default)(async (req, res) => {
    const user = req.user;
    const { ...passwordData } = req.body;
    await auth_service_1.AuthService.changePasswordToDB(user, passwordData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Your password has been successfully changed',
    });
});
const refreshToken = (0, catchAsync_1.default)(async (req, res) => {
    const { ...tokenData } = req.body;
    const result = await auth_service_1.AuthService.refreshTokenToDB(tokenData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Token refreshed successfully.',
        data: result,
    });
});
const logout = (0, catchAsync_1.default)(async (req, res) => {
    const { ...tokenData } = req.body;
    await auth_service_1.AuthService.logoutFromDB(tokenData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'User logged out successfully.',
    });
});
exports.AuthController = {
    verifyEmail,
    loginUser,
    forgetPassword,
    resetPassword,
    changePassword,
    resendOtp,
    registerUser,
    refreshToken,
    logout,
};
//# sourceMappingURL=auth.controller.js.map