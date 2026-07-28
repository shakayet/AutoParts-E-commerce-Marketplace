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
exports.ReviewService = void 0;
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
const review_model_1 = require("./review.model");
const product_model_1 = require("../product/product.model");
const notification_model_1 = require("../notification/notification.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const createReviewToDB = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, rating, comment } = payload;
    // ensure product exists
    const product = yield product_model_1.Product.findById(productId);
    if (!product)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Product not found');
    // ensure user hasn't already reviewed
    const existing = yield review_model_1.Review.findOne({ productId, userId });
    if (existing)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You have already reviewed this product');
    // create review
    const review = yield review_model_1.Review.create({ productId, userId, rating, comment });
    // update product avg rating and totalRatings
    const totalRatings = (product.totalRatings || 0) + 1;
    const totalRatingScore = (product.averageRating || 0) * (product.totalRatings || 0) + rating;
    const averageRating = totalRatingScore / totalRatings;
    product.averageRating = averageRating;
    product.totalRatings = totalRatings;
    yield product.save();
    // create notification for seller
    const notification = yield notification_model_1.Notification.create({
        user: product.sellerId,
        type: 'NEW_REVIEW',
        data: { productId, reviewId: review._id, rating, comment, from: userId },
    });
    // emit socket event globally (if available)
    try {
        const io = global.io;
        if (io)
            io.to(product.sellerId.toString()).emit('NEW_REVIEW', notification);
    }
    catch (err) {
        console.error('Error emitting NEW_REVIEW event:', err);
    }
    return review;
});
const getReviewsForProduct = (productId_1, ...args_1) => __awaiter(void 0, [productId_1, ...args_1], void 0, function* (productId, query = {}) {
    const queryBuilder = new QueryBuilder_1.default(review_model_1.Review.find({ productId }).populate('userId', 'name email'), query)
        .sort()
        .paginate()
        .fields();
    const [reviews, total] = yield Promise.all([
        queryBuilder.modelQuery.exec(),
        queryBuilder.getPaginationInfo(),
    ]);
    return {
        data: reviews,
        meta: {
            total: total.total,
            page: total.page,
            limit: total.limit,
            totalPages: total.totalPage,
        },
    };
});
const deleteReview = (reviewId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const rev = yield review_model_1.Review.findOne({ _id: reviewId, userId });
    if (!rev)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Review not found');
    const product = yield product_model_1.Product.findById(rev.productId);
    if (product) {
        const totalRatings = Math.max(0, (product.totalRatings || 1) - 1);
        const totalRatingScore = (product.averageRating || 0) * (product.totalRatings || 0) - rev.rating;
        const averageRating = totalRatings === 0 ? 0 : totalRatingScore / totalRatings;
        product.averageRating = averageRating;
        product.totalRatings = totalRatings;
        yield product.save();
    }
    yield review_model_1.Review.deleteOne({ _id: reviewId });
});
const getTopReviewsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield review_model_1.Review.find({})
        .populate('userId', 'name email image')
        .populate('productId', 'title mainImage')
        .sort({ rating: -1, createdAt: -1 })
        .limit(15);
    return reviews;
});
exports.ReviewService = {
    createReviewToDB,
    getReviewsForProduct,
    deleteReview,
    getTopReviewsFromDB,
};
