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
exports.ReportService = void 0;
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
const report_model_1 = require("./report.model");
const notification_model_1 = require("../notification/notification.model");
const storage_service_1 = __importDefault(require("../../services/storage.service"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const product_model_1 = require("../product/product.model");
const user_model_1 = require("../user/user.model");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const emailHelper_1 = require("../../../helpers/emailHelper");
const createReportToDB = (reporterId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield report_model_1.Report.create(Object.assign({ reporterId }, payload));
    // create admin notification
    const notification = yield notification_model_1.Notification.create({
        user: reporterId, // system/admin recipient; front-end/admin dashboard will query reports
        type: 'PRODUCT_REPORTED',
        data: Object.assign({ reportId: result._id }, payload),
    });
    // emit global event
    try {
        const io = global.io;
        if (io)
            io.emit('REPORT_CREATED', notification);
    }
    catch (err) {
        console.error('Error emitting NEW_REVIEW event:', err);
    }
    return result;
});
const deleteReportFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield report_model_1.Report.findByIdAndDelete(id);
    if (!res)
        throw new Error('Report not found');
    if (res.image) {
        yield storage_service_1.default.deleteByUrl(res.image);
    }
});
const getReportsFromDB = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    const searchableFields = ['reason', 'status'];
    const baseQuery = report_model_1.Report.find({}).populate('reporterId', 'name email');
    const queryBuilder = new QueryBuilder_1.default(baseQuery, query)
        .search(searchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const [reports, total] = yield Promise.all([
        queryBuilder.modelQuery.exec(),
        queryBuilder.getPaginationInfo(),
    ]);
    return {
        data: reports,
        meta: {
            total: total.total,
            page: total.page,
            limit: total.limit,
            totalPages: total.totalPage,
        },
    };
});
const updateReportStatusToDB = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const report = yield report_model_1.Report.findById(id);
    if (!report)
        throw new Error('Report not found');
    report.status = status;
    yield report.save();
    return report;
});
const reviewReportToDB = (id, status, explanation) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const report = yield report_model_1.Report.findById(id);
    if (!report)
        throw new Error('Report not found');
    report.status = status;
    report.adminNote = explanation;
    yield report.save();
    const reporter = yield user_model_1.User.findById(report.reporterId);
    const email = (reporter === null || reporter === void 0 ? void 0 : reporter.email) || undefined;
    let productName;
    let productId;
    let productDetails;
    if (report.type === 'product') {
        const product = yield product_model_1.Product.findById(report.targetId);
        if (product) {
            productName = product.title;
            productId = String(product._id);
            productDetails = `Condition: ${product.condition || 'N/A'}, Price: ${(_a = product.price) !== null && _a !== void 0 ? _a : 'N/A'}`;
        }
    }
    if (email) {
        const tpl = emailTemplate_1.emailTemplate.reportStatusUpdate({
            email,
            decision: status,
            explanation,
            productName,
            productId,
            productDetails,
        });
        yield emailHelper_1.emailHelper.sendEmail(tpl);
    }
    return report;
});
exports.ReportService = {
    createReportToDB,
    deleteReportFromDB,
    getReportsFromDB,
    updateReportStatusToDB,
    reviewReportToDB,
};
