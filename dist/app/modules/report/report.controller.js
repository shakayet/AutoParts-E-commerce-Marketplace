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
exports.ReportController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const report_service_1 = require("./report.service");
const http_status_codes_1 = require("http-status-codes");
const getFilePath_1 = require("../../../shared/getFilePath");
const createReport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user; // Use proper type instead of 'any'
    const payload = req.body;
    // Validate required fields
    if (!payload.type || !payload.targetId || !payload.reason) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message: 'Missing required fields: type, targetId, or reason',
            data: null,
        });
    }
    const image = (0, getFilePath_1.getSingleFilePath)(req.files, 'image');
    const data = Object.assign(Object.assign({}, payload), { image });
    const result = yield report_service_1.ReportService.createReportToDB(user.id, data);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: 'Report submitted successfully',
        data: result,
    });
}));
const getReports = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield report_service_1.ReportService.getReportsFromDB(query);
    (0, sendResponse_1.default)(res, Object.assign(Object.assign({ success: true, statusCode: http_status_codes_1.StatusCodes.OK, message: 'Reports retrieved successfully' }, (result.meta ? { meta: result.meta } : {})), { data: result.data }));
}));
const updateReportStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    const result = yield report_service_1.ReportService.updateReportStatusToDB(id, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Report status updated successfully',
        data: result,
    });
}));
const reviewReport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status, explanation } = req.body;
    const result = yield report_service_1.ReportService.reviewReportToDB(id, status, explanation);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Report reviewed successfully',
        data: result,
    });
}));
const deleteReport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield report_service_1.ReportService.deleteReportFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Report deleted successfully',
        data: null,
    });
}));
exports.ReportController = {
    createReport,
    getReports,
    updateReportStatus,
    reviewReport,
    deleteReport,
};
