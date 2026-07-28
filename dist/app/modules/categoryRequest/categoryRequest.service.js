"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRequestService = void 0;
/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const category_model_1 = require("../category/category.model");
const categoryRequest_model_1 = require("./categoryRequest.model");
const notification_model_1 = require("../notification/notification.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const createCategoryRequestToDB = async (requesterId, payload) => {
    try {
        const reqDoc = await categoryRequest_model_1.CategoryRequest.create({
            requesterId,
            name: payload.name,
            image: payload.image,
            description: payload.description,
        });
        return reqDoc;
    }
    catch (error) {
        if (error?.code === 11000 &&
            typeof error?.message === 'string' &&
            error.message.includes('icon_1')) {
            try {
                await categoryRequest_model_1.CategoryRequest.collection.dropIndex('icon_1');
                const reqDoc = await categoryRequest_model_1.CategoryRequest.create({
                    requesterId,
                    name: payload.name,
                    image: payload.image,
                    description: payload.description,
                });
                return reqDoc;
            }
            catch (innerErr) {
                throw innerErr;
            }
        }
        throw error;
    }
};
const getCategoryRequestsFromDB = async (query = {}) => {
    const searchableFields = ['name', 'description'];
    const queryBuilder = new QueryBuilder_1.default(categoryRequest_model_1.CategoryRequest.find({}), query)
        .search(searchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const [categoryRequests, total] = await Promise.all([
        queryBuilder.modelQuery.exec(),
        queryBuilder.getPaginationInfo(),
    ]);
    return {
        data: categoryRequests,
        meta: {
            total: total.total,
            page: total.page,
            limit: total.limit,
            totalPages: total.totalPage,
        },
    };
};
const reviewCategoryRequestToDB = async (id, status, adminComment) => {
    const req = await categoryRequest_model_1.CategoryRequest.findById(id).populate('requesterId', '_id name email');
    if (!req)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Category request not found');
    req.status = status;
    await req.save();
    if (status === 'approved') {
        const slug = req.name
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        await category_model_1.Category.findOneAndUpdate({ name: req.name }, {
            $set: {
                name: req.name,
                description: req.description,
                image: req.image || 'https://i.ibb.co/z5YHLV9/profile.png', // Fallback for required field
                slug,
            },
        }, { upsert: true, new: true });
    }
    // notify requester
    try {
        const notification = await notification_model_1.Notification.create({
            user: req.requesterId,
            type: status === 'approved'
                ? 'CATEGORY_REQUEST_APPROVED'
                : 'CATEGORY_REQUEST_REJECTED',
            data: { requestId: req._id, status, adminComment },
        });
        // emit via socket if available
        try {
            const io = globalThis.io;
            const toId = String(req.requesterId);
            if (io && toId)
                io.to(toId).emit('CATEGORY_REQUEST_UPDATE', notification);
        }
        catch (err) {
            // log and continue
            // eslint-disable-next-line no-console
            console.error(err);
        }
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
    }
    return req;
};
const deleteCategoryRequestFromDB = async (id) => {
    const res = await categoryRequest_model_1.CategoryRequest.findByIdAndDelete(id);
    if (!res)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Category request not found');
};
exports.CategoryRequestService = {
    createCategoryRequestToDB,
    getCategoryRequestsFromDB,
    reviewCategoryRequestToDB,
    deleteCategoryRequestFromDB,
};
//# sourceMappingURL=categoryRequest.service.js.map