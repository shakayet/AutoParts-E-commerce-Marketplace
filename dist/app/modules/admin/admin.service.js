"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const product_model_1 = require("../product/product.model");
const category_model_1 = require("../category/category.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const getTopProducts = async () => {
    const products = await product_model_1.Product.find({})
        .sort({ averageRating: -1, totalRatings: -1 })
        .limit(10);
    return products;
};
const getCategorySummary = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const [result] = await category_model_1.Category.aggregate([
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
    const total = result?.totalCount?.[0]?.total || 0;
    const totalPage = Math.ceil(total / limit) || 0;
    return {
        data: result?.data || [],
        meta: {
            total,
            page,
            limit,
            totalPage,
        },
    };
};
const getProducts = async (query) => {
    const productQuery = new QueryBuilder_1.default(product_model_1.Product.find({}), query)
        .search(['name', 'description'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = await productQuery.modelQuery;
    const meta = await productQuery.countTotal();
    return {
        meta,
        data: result,
    };
};
const getProduct = async (id) => {
    const result = await product_model_1.Product.findById(id);
    return result;
};
exports.AdminService = {
    getTopProducts,
    getCategorySummary,
    getProducts,
    getProduct,
};
//# sourceMappingURL=admin.service.js.map