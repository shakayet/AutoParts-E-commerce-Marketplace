"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const faq_model_1 = require("./faq.model");
const storage_service_1 = __importDefault(require("../../services/storage.service"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const createFAQToDB = async (payload) => {
    const doc = await faq_model_1.FAQ.create(payload);
    return doc;
};
const updateFAQToDB = async (id, payload) => {
    const existing = await faq_model_1.FAQ.findById(id);
    if (!existing)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'FAQ not found');
    if (payload.image && existing.image) {
        await storage_service_1.default.deleteByUrl(existing.image);
    }
    const doc = await faq_model_1.FAQ.findByIdAndUpdate(id, payload, { new: true });
    if (!doc)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'FAQ not found');
    return doc;
};
const deleteFAQFromDB = async (id) => {
    const res = await faq_model_1.FAQ.findByIdAndDelete(id);
    if (!res)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'FAQ not found');
    if (res.image) {
        await storage_service_1.default.deleteByUrl(res.image);
    }
};
const getFAQsFromDB = async () => {
    return await faq_model_1.FAQ.find({ isActive: true }).sort({ createdAt: -1 });
};
exports.FAQService = {
    createFAQToDB,
    updateFAQToDB,
    deleteFAQFromDB,
    getFAQsFromDB,
};
//# sourceMappingURL=faq.service.js.map