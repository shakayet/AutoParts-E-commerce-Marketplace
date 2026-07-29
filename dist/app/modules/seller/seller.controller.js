"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const seller_service_1 = require("./seller.service");
const http_status_codes_1 = require("http-status-codes");
const getSellerLocationLink = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await seller_service_1.SellerService.getSellerLocationLinkFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Seller location retrieved',
        data: result,
    });
});
exports.SellerController = { getSellerLocationLink };
//# sourceMappingURL=seller.controller.js.map