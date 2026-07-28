"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQ = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const faqSchema = new mongoose_1.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    image: { type: String, default: true },
    isActive: { type: Boolean, default: true, required: true },
}, { timestamps: true });
exports.FAQ = (0, mongoose_1.model)('FAQ', faqSchema);
//# sourceMappingURL=faq.model.js.map