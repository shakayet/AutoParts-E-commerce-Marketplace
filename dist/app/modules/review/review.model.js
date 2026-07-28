"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
}, { timestamps: true });
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
exports.Review = (0, mongoose_1.model)('Review', reviewSchema);
