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
exports.AdminService = void 0;
const product_model_1 = require("../product/product.model");
const category_model_1 = require("../category/category.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const getTopProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield product_model_1.Product.find({})
        .sort({ averageRating: -1, totalRatings: -1 })
        .limit(10);
    return products;
});
const getCategorySummary = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const [result] = yield category_model_1.Category.aggregate([
        {
            $lookup: {
                from: 'products',
                localField: 'name',
                foreignField: 'category',
                as: 'products',
            },
        },
        {
            $project: {
                name: 1,
                itemCount: { $size: '$products' },
                createdAt: {
                    $dateToString: { format: '%d-%m-%Y', date: '$createdAt' },
                },
                updatedAt: {
                    $dateToString: { format: '%d-%m-%Y', date: '$updatedAt' },
                },
            },
        },
        {
            $sort: { itemCount: -1 },
        },
        {
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'total' }],
            },
        },
    ]);
    const total = ((_b = (_a = result === null || result === void 0 ? void 0 : result.totalCount) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
    const totalPage = Math.ceil(total / limit) || 0;
    return {
        data: (result === null || result === void 0 ? void 0 : result.data) || [],
        meta: {
            total,
            page,
            limit,
            totalPage,
        },
    };
});
const getProducts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const productQuery = new QueryBuilder_1.default(product_model_1.Product.find({}), query)
        .search(['name', 'description'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield productQuery.modelQuery;
    const meta = yield productQuery.countTotal();
    return {
        meta,
        data: result,
    };
});
const getProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_model_1.Product.findById(id);
    return result;
});
exports.AdminService = {
    getTopProducts,
    getCategorySummary,
    getProducts,
    getProduct,
};
