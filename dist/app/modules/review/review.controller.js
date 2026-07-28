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
exports.ReviewController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const review_service_1 = require("./review.service");
const review_model_1 = require("./review.model");
const product_model_1 = require("../product/product.model");
const createReview = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { productId, rating, comment } = req.body;
    const result = yield review_service_1.ReviewService.createReviewToDB(user.id, {
        productId,
        rating: Number(rating),
        comment,
    });
    const reviews = yield review_model_1.Review.find({ productId }).sort({ createdAt: -1 });
    if (!reviews.length) {
        return res
            .status(404)
            .json({ success: false, message: 'No reviews found for this product' });
    }
    const averageRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
        reviews.length;
    yield product_model_1.Product.findByIdAndUpdate(productId, {
        averageRating: Number(averageRating.toFixed(2)),
        ratingsCount: reviews.length,
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: 'Review created successfully',
        data: result,
    });
}));
const getReviews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const result = yield review_service_1.ReviewService.getReviewsForProduct(productId, req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Reviews retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const getTopReviews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield review_service_1.ReviewService.getTopReviewsFromDB();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Top reviews retrieved successfully',
        data: result,
    });
}));
exports.ReviewController = {
    createReview,
    getReviews,
    getTopReviews,
};
