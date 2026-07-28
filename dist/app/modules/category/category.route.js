"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("./category.controller");
const category_validation_1 = require("./category.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const getFilePath_1 = require("../../../shared/getFilePath");
const router = express_1.default.Router();
router
    .route('/')
    .get((0, validateRequest_1.default)(category_validation_1.CategoryValidation.getCategoriesZodSchema), category_controller_1.CategoryController.getCategories)
    .post((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, fileUploadHandler_1.default)(), // multer middleware
(req, res, next) => {
    if (req.body.data) {
        req.body = {
            ...JSON.parse(req.body.data),
        };
    }
    const imagePath = (0, getFilePath_1.getSingleFilePath)(req.files, 'image');
    if (imagePath) {
        req.body.image = imagePath;
    }
    const iconPath = (0, getFilePath_1.getSingleFilePath)(req.files, 'icon');
    if (iconPath) {
        req.body.icon = iconPath;
    }
    // Validate after merging file paths into body
    category_validation_1.CategoryValidation.createCategoryZodSchema.parse(req.body);
    return category_controller_1.CategoryController.createCategory(req, res, next);
});
router
    .route('/:id')
    .get(category_controller_1.CategoryController.getSingleCategory)
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    if (req.body.data) {
        req.body = {
            ...JSON.parse(req.body.data),
        };
    }
    const imagePath = (0, getFilePath_1.getSingleFilePath)(req.files, 'image');
    if (imagePath) {
        req.body.image = imagePath;
    }
    const iconPath = (0, getFilePath_1.getSingleFilePath)(req.files, 'icon');
    if (iconPath) {
        req.body.icon = iconPath;
    }
    // Validate after merging file paths into body
    category_validation_1.CategoryValidation.updateCategoryZodSchema.parse(req.body);
    return category_controller_1.CategoryController.updateCategory(req, res, next);
})
    .delete((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), category_controller_1.CategoryController.deleteCategory);
exports.CategoryRoutes = router;
//# sourceMappingURL=category.route.js.map