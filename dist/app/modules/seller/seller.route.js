"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const seller_controller_1 = require("./seller.controller");
const seller_validation_1 = require("./seller.validation");
const router = express_1.default.Router();
router
    .route('/:id/location')
    .get((0, validateRequest_1.default)(seller_validation_1.SellerValidation.getSellerLocationZodSchema), seller_controller_1.SellerController.getSellerLocationLink);
exports.SellerRoutes = router;
//# sourceMappingURL=seller.route.js.map