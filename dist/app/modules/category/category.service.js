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
exports.CategoryService = void 0;
/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const category_model_1 = require("./category.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const createCategoryToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield category_model_1.Category.findOne({ name: payload.name });
    if (exists)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Category already exists');
    try {
        const cat = yield category_model_1.Category.create(payload);
        return cat;
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000 &&
            typeof (error === null || error === void 0 ? void 0 : error.message) === 'string' &&
            error.message.includes('icon_1')) {
            try {
                yield category_model_1.Category.collection.dropIndex('icon_1');
                const cat = yield category_model_1.Category.create(payload);
                return cat;
            }
            catch (innerErr) {
                throw innerErr;
            }
        }
        throw error;
    }
});
const updateCategoryToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield category_model_1.Category.findById(id);
    if (!existing)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Category not found');
    const cat = yield category_model_1.Category.findByIdAndUpdate(id, payload, { new: true });
    if (!cat)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Category not found');
    return cat;
});
const deleteCategoryFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield category_model_1.Category.findByIdAndDelete(id);
    if (!res)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Category not found');
});
const getSingleCategoryFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield category_model_1.Category.findOne({ _id: id });
    if (!res)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Category not found');
    return res;
});
const getCategoriesFromDB = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    const searchableFields = ['name', 'description'];
    const queryBuilder = new QueryBuilder_1.default(category_model_1.Category.find({}), query)
        .search(searchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const [categories, total] = yield Promise.all([
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
});
exports.CategoryService = {
    createCategoryToDB,
    updateCategoryToDB,
    deleteCategoryFromDB,
    getCategoriesFromDB,
    getSingleCategoryFromDB,
};
