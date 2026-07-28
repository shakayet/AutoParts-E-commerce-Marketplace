"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermsService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const terms_model_1 = require("./terms.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const createTermsToDB = async (payload) => {
    const doc = await terms_model_1.Terms.create(payload);
    return doc;
};
const updateTermsToDB = async (id, payload) => {
    const doc = await terms_model_1.Terms.findByIdAndUpdate(id, payload, { new: true });
    if (!doc)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Terms not found');
    return doc;
};
const deleteTermsFromDB = async (id) => {
    const res = await terms_model_1.Terms.findByIdAndDelete(id);
    if (!res)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Terms not found');
};
const getTermsFromDB = async () => {
    return await terms_model_1.Terms.find({ isActive: true }).sort({ createdAt: -1 });
};
exports.TermsService = {
    createTermsToDB,
    updateTermsToDB,
    deleteTermsFromDB,
    getTermsFromDB,
};
//# sourceMappingURL=terms.service.js.map