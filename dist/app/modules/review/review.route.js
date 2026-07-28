"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const review_controller_1 = require("./review.controller");
const review_validation_1 = require("./review.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router.route('/top-reviews').get(review_controller_1.ReviewController.getTopReviews);
router
    .route('/:productId')
    .get((0, validateRequest_1.default)(review_validation_1.ReviewValidation.getReviewsZodSchema), review_controller_1.ReviewController.getReviews);
router
    .route('/product/:productId')
    .get((0, validateRequest_1.default)(review_validation_1.ReviewValidation.getReviewsZodSchema), review_controller_1.ReviewController.getReviews);
router
    .route('/')
    .post((0, auth_1.default)(user_1.USER_ROLES.USER), (0, validateRequest_1.default)(review_validation_1.ReviewValidation.createReviewZodSchema), review_controller_1.ReviewController.createReview);
exports.ReviewRoutes = router;
//# sourceMappingURL=review.route.js.map