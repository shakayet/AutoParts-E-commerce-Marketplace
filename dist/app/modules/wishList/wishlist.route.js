"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistRoutes = void 0;
const express_1 = __importDefault(require("express"));
const wishlist_controller_1 = require("./wishlist.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const wishlist_validation_1 = require("./wishlist.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router
    .route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.USER), (0, validateRequest_1.default)(wishlist_validation_1.WishlistValidation.getWishlist), wishlist_controller_1.WishlistController.getWishlist)
    .post((0, auth_1.default)(user_1.USER_ROLES.USER), (0, validateRequest_1.default)(wishlist_validation_1.WishlistValidation.addToWishlist), wishlist_controller_1.WishlistController.addToWishlist);
router
    .route('/:productId')
    .delete((0, auth_1.default)(user_1.USER_ROLES.USER), (0, validateRequest_1.default)(wishlist_validation_1.WishlistValidation.removeFromWishlist), wishlist_controller_1.WishlistController.removeFromWishlist);
exports.WishlistRoutes = router;
