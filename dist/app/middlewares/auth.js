"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const jwtHelper_1 = require("../../helpers/jwtHelper");
const user_model_1 = require("../modules/user/user.model");
const auth = (...roles) => async (req, res, next) => {
    try {
        const tokenWithBearer = req.headers.authorization;
        if (!tokenWithBearer) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized');
        }
        const [scheme, token, extra] = tokenWithBearer.trim().split(/\s+/);
        if (scheme !== 'Bearer' || !token || extra) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized');
        }
        const verifyUser = jwtHelper_1.jwtHelper.verifyToken(token, config_1.default.jwt.jwt_secret);
        const currentUser = await user_model_1.User.findById(verifyUser.id).select('role status isBlocked verified');
        if (!currentUser ||
            !currentUser.verified ||
            currentUser.status === 'banned' ||
            currentUser.isBlocked) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized');
        }
        verifyUser.role = currentUser.role;
        req.user = verifyUser;
        if (roles.length && !roles.includes(currentUser.role)) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You don't have permission to access this api");
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.default = auth;
//# sourceMappingURL=auth.js.map