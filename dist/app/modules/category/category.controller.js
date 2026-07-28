"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const category_service_1 = require("./category.service");
const http_status_codes_1 = require("http-status-codes");
const createCategory = (0, catchAsync_1.default)(async (req, res) => {
    const result = await category_service_1.CategoryService.createCategoryToDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: 'Category created successfully',
        data: result,
    });
});
const updateCategory = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await category_service_1.CategoryService.updateCategoryToDB(id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Category updated successfully',
        data: result,
    });
});
const deleteCategory = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    await category_service_1.CategoryService.deleteCategoryFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Category deleted successfully',
    });
});
const getSingleCategory = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await category_service_1.CategoryService.getSingleCategoryFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Get single Category successfully',
        data: result,
    });
});
const getCategories = (0, catchAsync_1.default)(async (req, res) => {
    const result = await category_service_1.CategoryService.getCategoriesFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Categories retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
exports.CategoryController = {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategories,
    getSingleCategory,
};
//# sourceMappingURL=category.controller.js.map