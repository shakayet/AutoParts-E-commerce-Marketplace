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
exports.PrivacyPolicyService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const privacyPolicy_model_1 = require("./privacyPolicy.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const createPrivacyPolicyToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield privacyPolicy_model_1.PrivacyPolicy.create(payload);
    return doc;
});
const updatePrivacyPolicyToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield privacyPolicy_model_1.PrivacyPolicy.findByIdAndUpdate(id, payload, { new: true });
    if (!doc)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Privacy policy not found');
    return doc;
});
const deletePrivacyPolicyFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield privacyPolicy_model_1.PrivacyPolicy.findByIdAndDelete(id);
    if (!res)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Privacy policy not found');
});
const getPrivacyPoliciesFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield privacyPolicy_model_1.PrivacyPolicy.find({ isActive: true }).sort({ createdAt: -1 });
});
exports.PrivacyPolicyService = {
    createPrivacyPolicyToDB,
    updatePrivacyPolicyToDB,
    deletePrivacyPolicyFromDB,
    getPrivacyPoliciesFromDB,
};
