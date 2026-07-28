"use strict";
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
const createReportToDB = async (reporterId, payload) => {
    const result = await report_model_1.Report.create({ reporterId, ...payload });
    // create admin notification
    const notification = await notification_model_1.Notification.create({
        user: reporterId, // system/admin recipient; front-end/admin dashboard will query reports
        type: 'PRODUCT_REPORTED',
        data: { reportId: result._id, ...payload },
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
};
const deleteReportFromDB = async (id) => {
    const res = await report_model_1.Report.findByIdAndDelete(id);
    if (!res)
        throw new Error('Report not found');
    if (res.image) {
        await storage_service_1.default.deleteByUrl(res.image);
    }
};
const getReportsFromDB = async (query = {}) => {
    const searchableFields = ['reason', 'status'];
    const baseQuery = report_model_1.Report.find({}).populate('reporterId', 'name email');
    const queryBuilder = new QueryBuilder_1.default(baseQuery, query)
        .search(searchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const [reports, total] = await Promise.all([
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
};
const updateReportStatusToDB = async (id, status) => {
    const report = await report_model_1.Report.findById(id);
    if (!report)
        throw new Error('Report not found');
    report.status = status;
    await report.save();
    return report;
};
const reviewReportToDB = async (id, status, explanation) => {
    const report = await report_model_1.Report.findById(id);
    if (!report)
        throw new Error('Report not found');
    report.status = status;
    report.adminNote = explanation;
    await report.save();
    const reporter = await user_model_1.User.findById(report.reporterId);
    const email = reporter?.email || undefined;
    let productName;
    let productId;
    let productDetails;
    if (report.type === 'product') {
        const product = await product_model_1.Product.findById(report.targetId);
        if (product) {
            productName = product.title;
            productId = String(product._id);
            productDetails = `Condition: ${product.condition || 'N/A'}, Price: ${product.price ?? 'N/A'}`;
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
        await emailHelper_1.emailHelper.sendEmail(tpl);
    }
    return report;
};
exports.ReportService = {
    createReportToDB,
    deleteReportFromDB,
    getReportsFromDB,
    updateReportStatusToDB,
    reviewReportToDB,
};
//# sourceMappingURL=report.service.js.map