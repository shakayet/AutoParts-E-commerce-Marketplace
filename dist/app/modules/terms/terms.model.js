"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Terms = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const termsSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.Terms = (0, mongoose_1.model)('Terms', termsSchema);
