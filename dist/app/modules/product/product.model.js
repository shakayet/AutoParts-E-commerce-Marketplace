"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    title: { type: String, required: true, text: true },
    category: { type: String, required: true, index: true },
    brand: { type: String },
    description: { type: String },
    carModels: [{ type: String }],
    chassisNumber: { type: String, index: true },
    condition: { type: String, enum: ['new', 'used', 'refurbished', 'newly imported'] },
    partsNumber: { type: String },
    warranty: { type: String },
    price: { type: Number, required: true },
    model: { type: String },
    year: { type: Number },
    discount: { type: Number, default: 0 },
    mainImage: { type: String },
    galleryImages: [{ type: String }],
    sellerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    sellerRating: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
}, { timestamps: true });
// text index for keyword search
productSchema.index({ title: 'text', description: 'text', brand: 'text' });
productSchema.index({ coordinates: '2dsphere' });
exports.Product = (0, mongoose_1.model)('Product', productSchema);
