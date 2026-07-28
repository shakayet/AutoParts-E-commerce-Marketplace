"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRequestRoutes = void 0;
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
const express_1 = __importDefault(require("express"));
const categoryRequest_controller_1 = require("./categoryRequest.controller");
const categoryRequest_validation_1 = require("./categoryRequest.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const getFilePath_1 = require("../../../shared/getFilePath");
const router = express_1.default.Router();
router
    .route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), categoryRequest_controller_1.CategoryRequestController.getCategoryRequests)
    .post((0, auth_1.default)(user_1.USER_ROLES.USER), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    if (req.body.data) {
        req.body = { ...JSON.parse(req.body.data) };
    }
    const image = (0, getFilePath_1.getSingleFilePath)(req.files, 'image');
    if (image)
        req.body.image = image;
    categoryRequest_validation_1.CategoryRequestValidation.createCategoryRequestZodSchema.parse({
        body: req.body,
    });
    next();
}, categoryRequest_controller_1.CategoryRequestController.createCategoryRequest);
router
    .route('/:id')
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, validateRequest_1.default)(categoryRequest_validation_1.CategoryRequestValidation.reviewCategoryRequestZodSchema), categoryRequest_controller_1.CategoryRequestController.reviewCategoryRequest)
    .delete((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), categoryRequest_controller_1.CategoryRequestController.deleteCategoryRequest);
exports.CategoryRequestRoutes = router;
//# sourceMappingURL=categoryRequest.route.js.map