"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    icon: { type: String },
    description: { type: String },
}, { timestamps: true });
// categorySchema.index({ name: 1 });
exports.Category = (0, mongoose_1.model)('Category', categorySchema);
//# sourceMappingURL=category.model.js.map