"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const product_controller_1 = require("./product.controller");
const product_validation_1 = require("./product.validation");
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router
    .route('/')
    .get((0, validateRequest_1.default)(product_validation_1.ProductValidation.productQueryZodSchema), product_controller_1.ProductController.getProducts)
    .post((0, auth_1.default)(user_1.USER_ROLES.USER), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    var _a;
    req.body = product_validation_1.ProductValidation.createProductZodSchema.parse(JSON.parse((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.data));
    return product_controller_1.ProductController.createProduct(req, res, next);
});
router
    .route('/my-products')
    .get((0, auth_1.default)(user_1.USER_ROLES.USER), product_controller_1.ProductController.getMyProducts);
router
    .route('/search')
    .get((0, validateRequest_1.default)(product_validation_1.ProductValidation.searchProductQueryZodSchema), product_controller_1.ProductController.searchProducts);
router
    .route('/:id')
    .get(product_controller_1.ProductController.getProductById)
    .patch((0, auth_1.default)(user_1.USER_ROLES.USER), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    if (req.body.data) {
        req.body = product_validation_1.ProductValidation.createProductZodSchema.parse(JSON.parse(req.body.data));
    }
    return product_controller_1.ProductController.updateProduct(req, res, next);
})
    .delete((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), product_controller_1.ProductController.deleteProduct);
router.route('/:id/related').get(product_controller_1.ProductController.getRelatedProducts);
exports.ProductRoutes = router;
