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
exports.ProductController = exports.createProduct = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const product_service_1 = require("./product.service");
const product_model_1 = require("./product.model");
exports.createProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { mainImage: a, galleryImages: b } = req.files;
    const mainImage = a && a.length > 0
        ? a[0].url || `/${'image'}/${a[0].filename}`
        : undefined;
    const galleryImages = b && b.length > 0
        ? b.map((f) => f.url || `/${'image'}/${f.filename}`)
        : undefined;
    const body = req.body;
    const payload = Object.assign(Object.assign({}, body), { mainImage,
        galleryImages, sellerId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
    const result = yield product_service_1.ProductService.createProductToDB(payload);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: 'Product created successfully',
        data: result,
    });
}));
const updateProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const files = req.files;
    const mainImageFiles = (files === null || files === void 0 ? void 0 : files.mainImage) || [];
    const newGalleryFiles = (files === null || files === void 0 ? void 0 : files.galleryImages) || [];
    // Parse new URLs from uploaded files
    const newMainImage = mainImageFiles.length > 0
        ? mainImageFiles[0].url || `/${'image'}/${mainImageFiles[0].filename}`
        : undefined;
    const newGalleryUrls = newGalleryFiles.map((f) => f.url || `/${'image'}/${f.filename}`);
    // Extract body (Zod-validated)
    const body = req.body;
    const payload = Object.assign({}, body);
    // Update mainImage if a new file was uploaded
    if (newMainImage) {
        payload.mainImage = newMainImage;
    }
    // Merge existing gallery URLs (to keep) with new uploads
    const existingGalleryUrls = Array.isArray(body.galleryImages)
        ? body.galleryImages
        : [];
    // Important: If new files exist, we must combine them with the ones kept from the body
    if (newGalleryUrls.length > 0) {
        payload.galleryImages = [...existingGalleryUrls, ...newGalleryUrls];
    }
    // If no new files, but the body has a gallery array, use it (handles removals)
    else if (body.galleryImages) {
        payload.galleryImages = existingGalleryUrls;
    }
    const result = yield product_service_1.ProductService.updateProductToDB(id, payload);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Product updated successfully',
        data: result,
    });
}));
const deleteProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield product_service_1.ProductService.deleteProductFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Product deleted successfully',
    });
}));
const getProductById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield product_service_1.ProductService.getProductByIdFromDB(id);
    if (!result) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
            message: 'Product not found',
            data: null,
        });
    }
    // Calculate seller rating (corrected logic)
    const { sellerId } = result;
    const allProducts = yield product_model_1.Product.find({ sellerId });
    let sellerRating = 0;
    if (allProducts.length > 0) {
        const totalRatingsSum = allProducts.reduce((sum, product) => sum + (product.averageRating || 0) * (product.totalRatings || 0), 0);
        const totalRatingsCount = allProducts.reduce((sum, product) => sum + (product.totalRatings || 0), 0);
        sellerRating =
            totalRatingsCount > 0 ? totalRatingsSum / totalRatingsCount : 0;
    }
    // Add sellerRating to the response without saving to DB
    const responseData = Object.assign(Object.assign({}, result.toObject()), { sellerRating: Number(sellerRating.toFixed(2)) });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Product retrieved successfully',
        data: responseData,
    });
}));
const getProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = req.query;
    const result = yield product_service_1.ProductService.getProductsFromDB(filters);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Products retrieved successfully',
        data: result.data,
        pagination: {
            page: result.meta.page,
            limit: result.meta.limit,
            totalPage: result.meta.totalPages,
            total: result.meta.total,
        },
    });
}));
const searchProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield product_service_1.ProductService.searchProductsFromDB(query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Products searched successfully',
        data: result.data,
        pagination: {
            page: result.meta.page,
            limit: result.meta.limit,
            totalPage: result.meta.totalPages,
            total: result.meta.total,
        },
    });
}));
const getRelatedProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const filters = req.query;
    const result = yield product_service_1.ProductService.getRelatedProducts(id, filters);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Related products retrieved successfully',
        data: result.data,
        pagination: {
            page: result.meta.page,
            limit: result.meta.limit,
            totalPage: result.meta.totalPages,
            total: result.meta.total,
        },
    });
}));
const getMyProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const filters = req.query;
    const result = yield product_service_1.ProductService.getMyProductsFromDB((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, filters);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'My products retrieved successfully',
        data: result.data,
        pagination: {
            page: result.meta.page,
            limit: result.meta.limit,
            totalPage: result.meta.totalPages,
            total: result.meta.total,
        },
    });
}));
exports.ProductController = {
    createProduct: exports.createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProducts,
    getRelatedProducts,
    getMyProducts,
    searchProducts,
};
