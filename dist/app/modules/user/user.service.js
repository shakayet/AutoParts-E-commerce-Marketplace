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
exports.UserService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = require("http-status-codes");
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const emailHelper_1 = require("../../../helpers/emailHelper");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const storage_service_1 = __importDefault(require("../../services/storage.service"));
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const user_model_1 = require("./user.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const product_model_1 = require("../product/product.model");
const review_model_1 = require("../review/review.model");
const wishlist_model_1 = require("../wishList/wishlist.model");
const notification_model_1 = require("../notification/notification.model");
const report_model_1 = require("../report/report.model");
const createUserToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    //set role
    payload.role = user_1.USER_ROLES.USER;
    const createUser = yield user_model_1.User.create(payload);
    if (!createUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    //send email
    const otp = (0, generateOTP_1.default)();
    const values = {
        name: createUser.name,
        otp: otp,
        email: createUser.email,
    };
    const createAccountTemplate = emailTemplate_1.emailTemplate.createAccount(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };
    yield user_model_1.User.findOneAndUpdate({ _id: createUser._id }, { $set: { authentication } });
    return { user: createUser, otp };
});
const getUserProfileFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    return isExistUser;
});
const updateProfileToDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    // remove previous image from storage if a new one is provided
    if (payload.image && isExistUser.image) {
        yield storage_service_1.default.deleteByUrl(isExistUser.image);
    }
    const updateDoc = yield user_model_1.User.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    });
    return updateDoc;
});
const getAllUsersFromDB = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filter = {}) {
    const searchableFields = ['name', 'email', 'role', 'whatsappNumber'];
    const queryBuilder = new QueryBuilder_1.default(user_model_1.User.find({}), filter)
        .search(searchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const [users, total] = yield Promise.all([
        queryBuilder.modelQuery.exec(),
        queryBuilder.getPaginationInfo(),
    ]);
    return {
        data: users,
        meta: {
            total: total.total,
            page: total.page,
            limit: total.limit,
            totalPages: total.totalPage,
        },
    };
});
const getUserByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    }
    return user;
});
const changePasswordToDB = (user, oldPassword, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    // verify old password
    const isMatch = yield user_model_1.User.isMatchPassword(oldPassword, isExistUser.password);
    if (!isMatch) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Old password is incorrect');
    }
    yield user_model_1.User.findByIdAndUpdate(id, { password: newPassword });
});
const blockUnblockUserToDB = (userId, block) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    }
    const updated = yield user_model_1.User.findByIdAndUpdate(userId, { isBlocked: block }, { new: true });
    return updated;
});
const deleteUserFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield user_model_1.User.findByIdAndDelete(userId);
    if (!res) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    }
    if (res.image) {
        yield storage_service_1.default.deleteByUrl(res.image);
    }
});
const deleteAccountToDB = (user, password) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    // Verify password
    const isMatch = yield user_model_1.User.isMatchPassword(password, isExistUser.password);
    if (!isMatch) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Password is incorrect');
    }
    // Delete all user's products and their images
    const products = yield product_model_1.Product.find({ sellerId: id });
    for (const product of products) {
        if (product.mainImage) {
            yield storage_service_1.default.deleteByUrl(product.mainImage);
        }
        if (product.galleryImages && product.galleryImages.length > 0) {
            for (const image of product.galleryImages) {
                yield storage_service_1.default.deleteByUrl(image);
            }
        }
    }
    yield product_model_1.Product.deleteMany({ sellerId: id });
    // Delete all user's reviews
    yield review_model_1.Review.deleteMany({ userId: id });
    // Delete all user's wishlist items
    yield wishlist_model_1.Wishlist.deleteMany({ userId: id });
    // Delete all user's notifications
    yield notification_model_1.Notification.deleteMany({ user: id });
    // Delete all user's reports
    yield report_model_1.Report.deleteMany({ reporterId: id });
    // Delete user's profile image if it's not the default
    if (isExistUser.image &&
        isExistUser.image !== 'https://i.ibb.co/z5YHLV9/profile.png') {
        yield storage_service_1.default.deleteByUrl(isExistUser.image);
    }
    // Delete the user
    yield user_model_1.User.findByIdAndDelete(id);
});
exports.UserService = {
    createUserToDB,
    getUserProfileFromDB,
    updateProfileToDB,
    getAllUsersFromDB,
    getUserByIdFromDB,
    changePasswordToDB,
    blockUnblockUserToDB,
    deleteUserFromDB,
    deleteAccountToDB,
};
