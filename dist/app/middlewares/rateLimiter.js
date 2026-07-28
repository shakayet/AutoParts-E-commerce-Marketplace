"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = __importDefault(require("../../config"));
const rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.default.rateLimit.windowMs,
    max: config_1.default.rateLimit.max,
    message: {
        success: false,
        statusCode: 429,
        message: config_1.default.rateLimit.message,
        errorMessages: [
            {
                path: '',
                message: config_1.default.rateLimit.message,
            },
        ],
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.default = rateLimiter;
