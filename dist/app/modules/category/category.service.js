"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const category_model_1 = require("./category.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const createCategoryToDB = async (payload) => {
    const exists = await category_model_1.Category.findOne({ name: payload.name });
    if (exists)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Category already exists');
    try {
        const cat = await category_model_1.Category.create(payload);
        return cat;
    }
    catch (error) {
        if (error?.code === 11000 &&
            typeof error?.message === 'string' &&
            error.message.includes('icon_1')) {
            try {
                await category_model_1.Category.collection.dropIndex('icon_1');
                const cat = await category_model_1.Category.create(payload);
                return cat;
            }
            catch (innerErr) {
                throw innerErr;
            }
        }
        throw error;
    }
};
const updateCategoryToDB = async (id, payload) => {
    const existing = await category_model_1.Category.findById(id);
    if (!existing)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Category not found');
    const cat = await category_model_1.Category.findByIdAndUpdate(id, payload, { new: true });
    if (!cat)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Category not found');
    return cat;
};
const deleteCategoryFromDB = async (id) => {
    const res = await category_model_1.Category.findByIdAndDelete(id);
    if (!res)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Category not found');
};
const getSingleCategoryFromDB = async (id) => {
    const res = await category_model_1.Category.findOne({ _id: id });
    if (!res)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Category not found');
    return res;
};
const getCategoriesFromDB = async (query = {}) => {
    const searchableFields = ['name', 'description'];
    const queryBuilder = new QueryBuilder_1.default(category_model_1.Category.find({}), query)
        .search(searchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const [categories, total] = await Promise.all([
        queryBuilder.modelQuery.exec(),
        queryBuilder.getPaginationInfo(),
    ]);
    return {
        data: categories,
        meta: {
            total: total.total,
            page: total.page,
            limit: total.limit,
            totalPages: total.totalPage,
        },
    };
};
exports.CategoryService = {
    createCategoryToDB,
    updateCategoryToDB,
    deleteCategoryFromDB,
    getCategoriesFromDB,
    getSingleCategoryFromDB,
};
//# sourceMappingURL=category.service.js.map