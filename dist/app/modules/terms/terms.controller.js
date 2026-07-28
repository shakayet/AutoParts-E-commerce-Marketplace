"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermsController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const terms_service_1 = require("./terms.service");
const http_status_codes_1 = require("http-status-codes");
const createTerms = (0, catchAsync_1.default)(async (req, res) => {
    const result = await terms_service_1.TermsService.createTermsToDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: 'Terms created',
        data: result,
    });
});
const updateTerms = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await terms_service_1.TermsService.updateTermsToDB(id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Terms updated',
        data: result,
    });
});
const deleteTerms = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    await terms_service_1.TermsService.deleteTermsFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Terms deleted',
    });
});
const getTerms = (0, catchAsync_1.default)(async (req, res) => {
    const result = await terms_service_1.TermsService.getTermsFromDB();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Terms retrieved',
        data: result,
    });
});
exports.TermsController = {
    createTerms,
    updateTerms,
    deleteTerms,
    getTerms,
};
//# sourceMappingURL=terms.controller.js.map