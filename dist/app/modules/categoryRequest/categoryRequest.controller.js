"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRequestController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const categoryRequest_service_1 = require("./categoryRequest.service");
const http_status_codes_1 = require("http-status-codes");
const createCategoryRequest = (0, catchAsync_1.default)(async (req, res) => {
    const user = req.user;
    const userId = user?.id || user?._id || user?.userId;
    const payload = {
        name: req.body.name,
        image: req.body.image,
        description: req.body.description,
    };
    const result = await categoryRequest_service_1.CategoryRequestService.createCategoryRequestToDB(userId, payload);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: 'Category request submitted',
        data: result,
    });
});
const getCategoryRequests = (0, catchAsync_1.default)(async (req, res) => {
    const result = await categoryRequest_service_1.CategoryRequestService.getCategoryRequestsFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Category requests retrieved',
        meta: result.meta,
        data: result.data,
    });
});
const reviewCategoryRequest = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    const result = await categoryRequest_service_1.CategoryRequestService.reviewCategoryRequestToDB(id, status, adminComment);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Category request reviewed',
        data: result,
    });
});
const deleteCategoryRequest = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    await categoryRequest_service_1.CategoryRequestService.deleteCategoryRequestFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Category request deleted successfully',
    });
});
exports.CategoryRequestController = {
    createCategoryRequest,
    getCategoryRequests,
    reviewCategoryRequest,
    deleteCategoryRequest,
};
//# sourceMappingURL=categoryRequest.controller.js.map