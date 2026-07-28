"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const admin_service_1 = require("./admin.service");
const getTopProducts = (0, catchAsync_1.default)(async (req, res) => {
    const result = await admin_service_1.AdminService.getTopProducts();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Top products retrieved successfully',
        data: result,
    });
});
const getCategorySummary = (0, catchAsync_1.default)(async (req, res) => {
    const result = await admin_service_1.AdminService.getCategorySummary(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Category summary retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
const getProducts = (0, catchAsync_1.default)(async (req, res) => {
    const result = await admin_service_1.AdminService.getProducts(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Products retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
const getProduct = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await admin_service_1.AdminService.getProduct(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Product retrieved successfully',
        data: result,
    });
});
exports.AdminController = {
    getTopProducts,
    getCategorySummary,
    getProducts,
    getProduct,
};
//# sourceMappingURL=admin.controller.js.map