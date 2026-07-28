"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductValidation = void 0;
const zod_1 = require("zod");
const createProductZodSchema = zod_1.z.object({
    title: zod_1.z.string({ required_error: 'Title is required' }),
    category: zod_1.z.string({ required_error: 'Category is required' }),
    brand: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    carModels: zod_1.z.array(zod_1.z.string()).optional(),
    chassisNumber: zod_1.z.string().optional(),
    condition: zod_1.z.enum(['new', 'used', 'refurbished', 'newly imported']).optional(),
    warranty: zod_1.z.string().optional(),
    price: zod_1.z.number({ required_error: 'Price is required' }),
    discount: zod_1.z.number().optional(),
    mainImage: zod_1.z.string().optional(),
    galleryImages: zod_1.z.array(zod_1.z.string()).optional(),
});
const updateProductZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        brand: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        carModels: zod_1.z.array(zod_1.z.string()).optional(),
        chassisNumber: zod_1.z.string().optional(),
        condition: zod_1.z.enum(['new', 'used', 'refurbished', 'newly imported']).optional(),
        warranty: zod_1.z.string().optional(),
        price: zod_1.z.number().optional(),
        discount: zod_1.z.number().optional(),
    }),
});
const productQueryZodSchema = zod_1.z.object({
    query: zod_1.z.object({
        category: zod_1.z.string().optional(),
        brand: zod_1.z.string().optional(),
        carModel: zod_1.z.string().optional(),
        minPrice: zod_1.z.string().optional(),
        maxPrice: zod_1.z.string().optional(),
        chassisNumber: zod_1.z.string().optional(),
        keyword: zod_1.z.string().optional(),
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
    }),
});
const searchProductQueryZodSchema = zod_1.z.object({
    query: zod_1.z.object({
        searchTerm: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
        carModels: zod_1.z.string().optional(),
        brand: zod_1.z.string().optional(),
        userLat: zod_1.z.string().optional(),
        userLng: zod_1.z.string().optional(),
        radius: zod_1.z.string().optional(),
        lowestPrice: zod_1.z.string().optional(),
        highestPrice: zod_1.z.string().optional(),
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        sort: zod_1.z.string().optional(),
        fields: zod_1.z.string().optional(),
    }),
});
exports.ProductValidation = {
    createProductZodSchema,
    updateProductZodSchema,
    productQueryZodSchema,
    searchProductQueryZodSchema,
};
