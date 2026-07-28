"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const getFilePath_1 = require("../../../shared/getFilePath");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const user_service_1 = require("./user.service");
const createUser = (0, catchAsync_1.default)(async (req, res, next) => {
    const { ...userData } = req.body;
    const result = await user_service_1.UserService.createUserToDB(userData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'User created successfully',
        data: result.user,
    });
});
const getUserProfile = (0, catchAsync_1.default)(async (req, res) => {
    const user = req.user;
    const result = await user_service_1.UserService.getUserProfileFromDB(user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Profile data retrieved successfully',
        data: result,
    });
});
//update profile
const updateProfile = (0, catchAsync_1.default)(async (req, res, next) => {
    const user = req.user;
    const files = req.files;
    let image = (0, getFilePath_1.getSingleFilePath)(files, 'image');
    const data = {
        image,
        ...req.body,
    };
    const result = await user_service_1.UserService.updateProfileToDB(user, data);
    let out = result;
    if (out && typeof out?.toObject === 'function') {
        out = out.toObject();
    }
    if (out && out.authentication) {
        delete out.authentication;
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Profile updated successfully',
        data: out,
    });
});
const getAllUsers = (0, catchAsync_1.default)(async (req, res) => {
    const filters = req.query;
    const result = await user_service_1.UserService.getAllUsersFromDB(filters);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Users retrieved successfully',
        data: result.data,
        pagination: {
            page: result.meta.page,
            limit: result.meta.limit,
            totalPage: result.meta.totalPages,
            total: result.meta.total,
        },
    });
});
const getUserById = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await user_service_1.UserService.getUserByIdFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'User retrieved successfully',
        data: result,
    });
});
const changePassword = (0, catchAsync_1.default)(async (req, res, next) => {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;
    await user_service_1.UserService.changePasswordToDB(user, oldPassword, newPassword);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Password changed successfully',
    });
});
const blockUnblockUser = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { block } = req.body;
    const result = await user_service_1.UserService.blockUnblockUserToDB(id, block);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: block ? 'User blocked' : 'User unblocked',
        data: result,
    });
});
const deleteUser = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    await user_service_1.UserService.deleteUserFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'User deleted successfully',
    });
});
const deleteAccount = (0, catchAsync_1.default)(async (req, res) => {
    const user = req.user;
    const { password } = req.body;
    await user_service_1.UserService.deleteAccountToDB(user, password);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Account deleted successfully',
    });
});
exports.UserController = {
    createUser,
    getUserProfile,
    updateProfile,
    getAllUsers,
    getUserById,
    changePassword,
    blockUnblockUser,
    deleteUser,
    deleteAccount,
};
//# sourceMappingURL=user.controller.js.map