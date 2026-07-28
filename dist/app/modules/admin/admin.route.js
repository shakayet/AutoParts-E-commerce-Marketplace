"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const admin_controller_1 = require("./admin.controller");
const router = express_1.default.Router();
router.get('/top-products', admin_controller_1.AdminController.getTopProducts);
router.get('/category-summary', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), admin_controller_1.AdminController.getCategorySummary);
router.get('/products', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), admin_controller_1.AdminController.getProducts);
router.get('/products/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), admin_controller_1.AdminController.getProduct);
exports.AdminRoutes = router;
