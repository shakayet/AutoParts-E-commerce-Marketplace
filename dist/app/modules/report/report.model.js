"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const reportSchema = new mongoose_1.Schema({
    reporterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    type: { type: String, enum: ['product', 'seller'], required: true },
    targetId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'dismissed', 'resolved'],
        default: 'pending',
    },
    adminNote: { type: String },
    image: { type: String, required: true },
}, { timestamps: true });
reportSchema.index({ type: 1, targetId: 1 });
exports.Report = (0, mongoose_1.model)('Report', reportSchema);
//# sourceMappingURL=report.model.js.map