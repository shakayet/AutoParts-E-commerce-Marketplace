"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyPolicyController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const privacyPolicy_service_1 = require("./privacyPolicy.service");
const http_status_codes_1 = require("http-status-codes");
const createPrivacyPolicy = (0, catchAsync_1.default)(async (req, res) => {
    const result = await privacyPolicy_service_1.PrivacyPolicyService.createPrivacyPolicyToDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: 'Privacy policy created',
        data: result,
    });
});
const updatePrivacyPolicy = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await privacyPolicy_service_1.PrivacyPolicyService.updatePrivacyPolicyToDB(id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Privacy policy updated',
        data: result,
    });
});
const deletePrivacyPolicy = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    await privacyPolicy_service_1.PrivacyPolicyService.deletePrivacyPolicyFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Privacy policy deleted',
    });
});
const getPrivacyPolicies = (0, catchAsync_1.default)(async (req, res) => {
    const result = await privacyPolicy_service_1.PrivacyPolicyService.getPrivacyPoliciesFromDB();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Privacy policies retrieved',
        data: result,
    });
});
exports.PrivacyPolicyController = {
    createPrivacyPolicy,
    updatePrivacyPolicy,
    deletePrivacyPolicy,
    getPrivacyPolicies,
};
//# sourceMappingURL=privacyPolicy.controller.js.map