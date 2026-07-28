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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const product_model_1 = require("./product.model");
const storage_service_1 = __importDefault(require("../../services/storage.service"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const user_model_1 = require("../user/user.model");
const createProductToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const sellerId = payload.sellerId;
    if (!sellerId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Seller not specified');
    }
    const seller = yield user_model_1.User.findById(sellerId);
    if (!seller) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Seller not found');
    }
    const lat = (_a = seller.coordinates) === null || _a === void 0 ? void 0 : _a.lat;
    const lng = (_b = seller.coordinates) === null || _b === void 0 ? void 0 : _b.lng;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Seller location is not set. Please update your profile location first');
    }
    const doc = Object.assign(Object.assign({}, payload), { coordinates: {
            type: 'Point',
            coordinates: [lng, lat],
        } });
    const product = yield product_model_1.Product.create(doc);
    if (!product)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create product');
    return product;
});
const updateProductToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // if the payload contains new images we should clean up the old ones
    const existing = yield product_model_1.Product.findById(id);
    if (!existing) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Product not found');
    }
    if (payload.mainImage && existing.mainImage) {
        yield storage_service_1.default.deleteByUrl(existing.mainImage);
    }
    if (payload.galleryImages && Array.isArray(payload.galleryImages)) {
        const newGallery = payload.galleryImages;
        const oldGallery = existing.galleryImages || [];
        // delete any old urls that are not present in the new set
        for (const oldUrl of oldGallery) {
            if (!newGallery.includes(oldUrl)) {
                yield storage_service_1.default.deleteByUrl(oldUrl);
            }
        }
    }
    const product = yield product_model_1.Product.findByIdAndUpdate(id, payload, {
        new: true,
    });
    if (!product)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Product not found');
    return product;
});
const deleteProductFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield product_model_1.Product.findByIdAndDelete(id);
    if (!res)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Product not found');
    // clean up any images stored for this product
    if (res.mainImage) {
        yield storage_service_1.default.deleteByUrl(res.mainImage);
    }
    if (res.galleryImages && Array.isArray(res.galleryImages)) {
        for (const url of res.galleryImages) {
            yield storage_service_1.default.deleteByUrl(url);
        }
    }
});
const getProductByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.Product.findById(id).populate('sellerId', 'name coordinates address whatsappNumber');
    if (!product)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Product not found');
    return product;
});
const getProductsFromDB = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const { userLat, userLng, radius } = filters, restFilters = __rest(filters, ["userLat", "userLng", "radius"]);
    const baseQuery = { isBlocked: false };
    if (userLat && userLng) {
        baseQuery.coordinates = {
            $nearSphere: Object.assign({ $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(userLng), parseFloat(userLat)],
                } }, (radius && { $maxDistance: parseFloat(radius) * 1000 })),
        };
    }
    delete restFilters.lat;
    delete restFilters.lng;
    delete restFilters.radius;
    const queryBuilder = new QueryBuilder_1.default(product_model_1.Product.find(baseQuery).populate('sellerId', 'name whatsappNumber coordinates'), restFilters)
        .search(['title', 'description', 'brand', 'category'])
        .filter()
        .priceRange()
        .locationRadius();
    if (!(userLat && userLng)) {
        queryBuilder.sort();
    }
    queryBuilder.paginate().fields();
    const [products, total] = yield Promise.all([
        queryBuilder.modelQuery.exec(),
        queryBuilder.getPaginationInfo(),
    ]);
    return {
        data: products,
        meta: {
            total: total.total,
            page: total.page,
            limit: total.limit,
            totalPages: total.totalPage,
        },
    };
});
const searchProductsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm, category, title, carModels, brand, userLat, userLng, radius, lowestPrice, highestPrice, page: queryPage, limit: queryLimit, sort: querySort, fields: queryFields } = query, restFilters = __rest(query, ["searchTerm", "category", "title", "carModels", "brand", "userLat", "userLng", "radius", "lowestPrice", "highestPrice", "page", "limit", "sort", "fields"]);
    const page = Number(queryPage) || 1;
    const limit = Number(queryLimit) || 10;
    const skip = (page - 1) * limit;
    // If proximity search is requested
    if (userLat && userLng) {
        const pipeline = [];
        // Stage 1: $geoNear for distance-based sorting (must be first)
        pipeline.push({
            $geoNear: Object.assign(Object.assign({ near: {
                    type: 'Point',
                    coordinates: [
                        parseFloat(userLng),
                        parseFloat(userLat),
                    ],
                }, distanceField: 'distance', spherical: true }, (radius ? { maxDistance: parseFloat(radius) * 1000 } : {})), { query: { isBlocked: false } }),
        });
        // Stage 2: Filtering and Searching
        const matchStage = Object.assign({}, restFilters);
        if (category)
            matchStage.category = { $regex: category, $options: 'i' };
        if (title)
            matchStage.title = { $regex: title, $options: 'i' };
        if (brand)
            matchStage.brand = { $regex: brand, $options: 'i' };
        if (carModels)
            matchStage.carModels = { $regex: carModels, $options: 'i' };
        if (lowestPrice || highestPrice) {
            const priceFilter = {};
            if (lowestPrice)
                priceFilter.$gte = Number(lowestPrice);
            if (highestPrice)
                priceFilter.$lte = Number(highestPrice);
            matchStage.price = priceFilter;
        }
        if (searchTerm) {
            matchStage.$or = ['title', 'description', 'brand', 'category'].map(field => ({
                [field]: { $regex: searchTerm, $options: 'i' },
            }));
        }
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        // Clone pipeline for count before pagination
        const countPipeline = [...pipeline, { $count: 'total' }];
        // Stage 3: Pagination
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });
        // Stage 4: Projection (fields)
        if (queryFields) {
            const projection = { distance: 1 };
            queryFields
                .split(',')
                .forEach(f => (projection[f.trim()] = 1));
            pipeline.push({ $project: projection });
        }
        else {
            // Ensure distance is included if no specific fields are requested
            pipeline.push({ $addFields: { distance: '$distance' } });
        }
        // Execute aggregation and count
        const [products, countResult] = yield Promise.all([
            product_model_1.Product.aggregate(pipeline),
            product_model_1.Product.aggregate(countPipeline),
        ]);
        const totalCount = countResult.length > 0 ? countResult[0].total : 0;
        const totalPages = Math.ceil(totalCount / limit);
        // Populate the results
        const populatedProducts = yield product_model_1.Product.populate(products, {
            path: 'sellerId',
            select: 'name whatsappNumber coordinates',
        });
        return {
            data: populatedProducts,
            meta: {
                total: totalCount,
                page,
                limit,
                totalPages,
            },
        };
    }
    // Fallback to QueryBuilder for non-proximity search
    const baseQuery = { isBlocked: false };
    const filters = Object.assign({}, restFilters);
    if (category)
        filters.category = { $regex: category, $options: 'i' };
    if (title)
        filters.title = { $regex: title, $options: 'i' };
    if (brand)
        filters.brand = { $regex: brand, $options: 'i' };
    if (carModels)
        filters.carModels = { $regex: carModels, $options: 'i' };
    const queryBuilder = new QueryBuilder_1.default(product_model_1.Product.find(baseQuery).populate('sellerId', 'name whatsappNumber coordinates'), Object.assign(Object.assign({}, filters), { searchTerm,
        page,
        limit, sort: querySort, fields: queryFields, lowestPrice,
        highestPrice }))
        .search(['title', 'description', 'brand', 'category'])
        .filter()
        .priceRange()
        .sort()
        .paginate()
        .fields();
    const [products, total] = yield Promise.all([
        queryBuilder.modelQuery.exec(),
        queryBuilder.getPaginationInfo(),
    ]);
    return {
        data: products,
        meta: {
            total: total.total,
            page: total.page,
            limit: total.limit,
            totalPages: total.totalPage,
        },
    };
});
const getRelatedProducts = (productId_1, ...args_1) => __awaiter(void 0, [productId_1, ...args_1], void 0, function* (productId, filters = {}) {
    const prod = yield product_model_1.Product.findById(productId);
    if (!prod)
        return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    const queryBuilder = new QueryBuilder_1.default(product_model_1.Product.find({
        _id: { $ne: prod._id },
        category: prod.category,
    }).populate('sellerId', 'name whatsappNumber coordinates'), filters)
        .search(['title', 'description', 'brand', 'category'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const [products, total] = yield Promise.all([
        queryBuilder.modelQuery.exec(),
        queryBuilder.getPaginationInfo(),
    ]);
    return {
        data: products,
        meta: {
            total: total.total,
            page: total.page,
            limit: total.limit,
            totalPages: total.totalPage,
        },
    };
});
const getMyProductsFromDB = (sellerId_1, ...args_1) => __awaiter(void 0, [sellerId_1, ...args_1], void 0, function* (sellerId, filters = {}) {
    const queryBuilder = new QueryBuilder_1.default(product_model_1.Product.find({ sellerId }).populate('sellerId', 'name whatsappNumber coordinates'), filters)
        .search(['title', 'description', 'brand', 'category'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const [products, total] = yield Promise.all([
        queryBuilder.modelQuery.exec(),
        queryBuilder.getPaginationInfo(),
    ]);
    return {
        data: products,
        meta: {
            total: total.total,
            page: total.page,
            limit: total.limit,
            totalPages: total.totalPage,
        },
    };
});
exports.ProductService = {
    createProductToDB,
    updateProductToDB,
    deleteProductFromDB,
    getProductByIdFromDB,
    getProductsFromDB,
    getRelatedProducts,
    getMyProductsFromDB,
    searchProductsFromDB,
};
