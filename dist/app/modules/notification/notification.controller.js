"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const notification_service_1 = require("./notification.service");
const http_status_codes_1 = require("http-status-codes");
const getNotifications = (0, catchAsync_1.default)(async (req, res) => {
    const user = req.user;
    const { page, limit, isRead } = req.query;
    const opts = {};
    if (page)
        opts.page = Number(page);
    if (limit)
        opts.limit = Number(limit);
    if (isRead !== undefined)
        opts.isRead = isRead === 'true';
    const result = await notification_service_1.NotificationService.getNotificationsForUser(user.id, opts);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Notifications retrieved successfully',
        data: result,
    });
});
const markRead = (0, catchAsync_1.default)(async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    const result = await notification_service_1.NotificationService.markAsRead(id, user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Notification marked as read',
        data: result,
    });
});
const markAllRead = (0, catchAsync_1.default)(async (req, res) => {
    const user = req.user;
    const result = await notification_service_1.NotificationService.markAllAsRead(user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'All notifications marked as read',
        data: result,
    });
});
const deleteNotification = (0, catchAsync_1.default)(async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    const result = await notification_service_1.NotificationService.deleteNotification(id, user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Notification deleted',
        data: result,
    });
});
exports.NotificationController = {
    getNotifications,
    markRead,
    markAllRead,
    deleteNotification,
};
//# sourceMappingURL=notification.controller.js.map