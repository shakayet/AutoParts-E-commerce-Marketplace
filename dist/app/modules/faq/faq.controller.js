"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const faq_service_1 = require("./faq.service");
const http_status_codes_1 = require("http-status-codes");
const getFilePath_1 = require("../../../shared/getFilePath");
const createFAQ = (0, catchAsync_1.default)(async (req, res) => {
    const image = (0, getFilePath_1.getSingleFilePath)(req.files, 'image');
    const data = {
        image,
        ...req.body,
    };
    const result = await faq_service_1.FAQService.createFAQToDB(data);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: 'FAQ created successfully',
        data: result,
    });
});
const updateFAQ = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const image = (0, getFilePath_1.getSingleFilePath)(req.files, 'image');
    const data = {
        image,
        ...req.body,
    };
    const result = await faq_service_1.FAQService.updateFAQToDB(id, data);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'FAQ updated successfully',
        data: result,
    });
});
const deleteFAQ = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    await faq_service_1.FAQService.deleteFAQFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'FAQ deleted successfully',
    });
});
const getFAQs = (0, catchAsync_1.default)(async (req, res) => {
    const result = await faq_service_1.FAQService.getFAQsFromDB();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'FAQs retrieved successfully',
        data: result,
    });
});
exports.FAQController = { createFAQ, updateFAQ, deleteFAQ, getFAQs };
//# sourceMappingURL=faq.controller.js.map