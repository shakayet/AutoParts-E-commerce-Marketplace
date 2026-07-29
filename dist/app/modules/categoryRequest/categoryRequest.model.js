"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRequest = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const categoryRequestSchema = new mongoose_1.Schema({
    requesterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: { type: String, required: true },
    image: { type: String },
    description: { type: String },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
}, { timestamps: true });
exports.CategoryRequest = (0, mongoose_1.model)('CategoryRequest', categoryRequestSchema);
//# sourceMappingURL=categoryRequest.model.js.map