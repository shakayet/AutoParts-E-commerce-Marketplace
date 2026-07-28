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
exports.FAQService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const faq_model_1 = require("./faq.model");
const storage_service_1 = __importDefault(require("../../services/storage.service"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const createFAQToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield faq_model_1.FAQ.create(payload);
    return doc;
});
const updateFAQToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield faq_model_1.FAQ.findById(id);
    if (!existing)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'FAQ not found');
    if (payload.image && existing.image) {
        yield storage_service_1.default.deleteByUrl(existing.image);
    }
    const doc = yield faq_model_1.FAQ.findByIdAndUpdate(id, payload, { new: true });
    if (!doc)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'FAQ not found');
    return doc;
});
const deleteFAQFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield faq_model_1.FAQ.findByIdAndDelete(id);
    if (!res)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'FAQ not found');
    if (res.image) {
        yield storage_service_1.default.deleteByUrl(res.image);
    }
});
const getFAQsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield faq_model_1.FAQ.find({ isActive: true }).sort({ createdAt: -1 });
});
exports.FAQService = {
    createFAQToDB,
    updateFAQToDB,
    deleteFAQFromDB,
    getFAQsFromDB,
};
