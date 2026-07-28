"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const user_model_1 = require("../user/user.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const getSellerLocationLinkFromDB = (sellerId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(sellerId).select('+coordinates');
    if (!user)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Seller not found');
    const coords = user.coordinates;
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Seller coordinates not available');
    }
    const lat = coords.lat;
    const lng = coords.lng;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    return { url, lat, lng };
});
exports.SellerService = { getSellerLocationLinkFromDB };
