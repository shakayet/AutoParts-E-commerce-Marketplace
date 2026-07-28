"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyPolicyService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const privacyPolicy_model_1 = require("./privacyPolicy.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const createPrivacyPolicyToDB = async (payload) => {
    const doc = await privacyPolicy_model_1.PrivacyPolicy.create(payload);
    return doc;
};
const updatePrivacyPolicyToDB = async (id, payload) => {
    const doc = await privacyPolicy_model_1.PrivacyPolicy.findByIdAndUpdate(id, payload, { new: true });
    if (!doc)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Privacy policy not found');
    return doc;
};
const deletePrivacyPolicyFromDB = async (id) => {
    const res = await privacyPolicy_model_1.PrivacyPolicy.findByIdAndDelete(id);
    if (!res)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Privacy policy not found');
};
const getPrivacyPoliciesFromDB = async () => {
    return await privacyPolicy_model_1.PrivacyPolicy.find({ isActive: true }).sort({ createdAt: -1 });
};
exports.PrivacyPolicyService = {
    createPrivacyPolicyToDB,
    updatePrivacyPolicyToDB,
    deletePrivacyPolicyFromDB,
    getPrivacyPoliciesFromDB,
};
//# sourceMappingURL=privacyPolicy.service.js.map