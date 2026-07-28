"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const notification_controller_1 = require("./notification.controller");
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router
    .route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), notification_controller_1.NotificationController.getNotifications);
router
    .route('/:id/read')
    .patch((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), notification_controller_1.NotificationController.markRead);
router
    .route('/read/all')
    .patch((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), notification_controller_1.NotificationController.markAllRead);
router
    .route('/:id')
    .delete((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), notification_controller_1.NotificationController.deleteNotification);
exports.NotificationRoutes = router;
//# sourceMappingURL=notification.route.js.map