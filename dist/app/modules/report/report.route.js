"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const report_controller_1 = require("./report.controller");
const report_validation_1 = require("./report.validation");
const user_1 = require("../../../enums/user");
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const router = express_1.default.Router();
router
    .route('/')
    .post((0, auth_1.default)(user_1.USER_ROLES.USER), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    var _a;
    req.body = report_validation_1.ReportValidation.createReportZodSchema.parse(JSON.parse((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.data));
    return report_controller_1.ReportController.createReport(req, res, next);
});
router
    .route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, validateRequest_1.default)(report_validation_1.ReportValidation.getReportsZodSchema), report_controller_1.ReportController.getReports);
router
    .route('/:id')
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, validateRequest_1.default)(report_validation_1.ReportValidation.updateReportStatusZodSchema), report_controller_1.ReportController.updateReportStatus)
    .delete((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), report_controller_1.ReportController.deleteReport);
router
    .route('/:id/decision')
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, validateRequest_1.default)(report_validation_1.ReportValidation.reviewReportZodSchema), report_controller_1.ReportController.reviewReport);
exports.ReportRoutes = router;
