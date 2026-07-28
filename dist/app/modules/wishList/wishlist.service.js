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
exports.WishlistService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const wishlist_model_1 = require("./wishlist.model");
const product_model_1 = require("../product/product.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const addToWishlist = (userId, productId) => __awaiter(void 0, void 0, void 0, function* () {
    const productExists = yield product_model_1.Product.findById(productId);
    if (!productExists)
        throw new Error('Product not found');
    const existing = yield wishlist_model_1.Wishlist.findOne({ userId, productId });
    if (existing)
        throw new Error('Product already in wishlist');
    const result = yield wishlist_model_1.Wishlist.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        productId: new mongoose_1.Types.ObjectId(productId),
    });
    return result;
});
const getWishlist = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, query = {}) {
    const queryBuilder = new QueryBuilder_1.default(wishlist_model_1.Wishlist.find({ userId }).populate('productId'), query)
        .sort()
        .paginate()
        .fields();
    const [wishlist, total] = yield Promise.all([
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
});
const removeFromWishlist = (userId, productId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wishlist_model_1.Wishlist.findOneAndDelete({ userId, productId });
    if (!result)
        throw new Error('Product not found in wishlist');
    return result;
});
exports.WishlistService = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
};
