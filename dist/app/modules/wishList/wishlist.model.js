"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wishlist = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const wishlistSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
}, { timestamps: true });
// Prevent duplicate wishlist items for same user-product pair
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });
exports.Wishlist = (0, mongoose_1.model)('Wishlist', wishlistSchema);
//# sourceMappingURL=wishlist.model.js.map