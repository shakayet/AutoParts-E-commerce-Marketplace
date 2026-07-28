"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistController = void 0;
const http_status_codes_1 = require("http-status-codes");
const wishlist_service_1 = require("./wishlist.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const addToWishlist = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.body;
    const result = await wishlist_service_1.WishlistService.addToWishlist(userId, productId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: 'Product added to wishlist successfully',
        data: result,
    });
});
const getWishlist = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user.id;
    const result = await wishlist_service_1.WishlistService.getWishlist(userId, req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Wishlist retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
const removeFromWishlist = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;
    const result = await wishlist_service_1.WishlistService.removeFromWishlist(userId, productId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Product removed from wishlist successfully',
        data: result,
    });
});
exports.WishlistController = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
};
//# sourceMappingURL=wishlist.controller.js.map