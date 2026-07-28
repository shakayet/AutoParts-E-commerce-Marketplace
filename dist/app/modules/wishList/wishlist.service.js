"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const wishlist_model_1 = require("./wishlist.model");
const product_model_1 = require("../product/product.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const addToWishlist = async (userId, productId) => {
    const productExists = await product_model_1.Product.findById(productId);
    if (!productExists)
        throw new Error('Product not found');
    const existing = await wishlist_model_1.Wishlist.findOne({ userId, productId });
    if (existing)
        throw new Error('Product already in wishlist');
    const result = await wishlist_model_1.Wishlist.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        productId: new mongoose_1.Types.ObjectId(productId),
    });
    return result;
};
const getWishlist = async (userId, query = {}) => {
    const queryBuilder = new QueryBuilder_1.default(wishlist_model_1.Wishlist.find({ userId }).populate('productId'), query)
        .sort()
        .paginate()
        .fields();
    const [wishlist, total] = await Promise.all([
        queryBuilder.modelQuery.exec(),
        queryBuilder.getPaginationInfo(),
    ]);
    return {
        data: wishlist,
        meta: {
            total: total.total,
            page: total.page,
            limit: total.limit,
            totalPages: total.totalPage,
        },
    };
};
const removeFromWishlist = async (userId, productId) => {
    const result = await wishlist_model_1.Wishlist.findOneAndDelete({ userId, productId });
    if (!result)
        throw new Error('Product not found in wishlist');
    return result;
};
exports.WishlistService = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
};
//# sourceMappingURL=wishlist.service.js.map