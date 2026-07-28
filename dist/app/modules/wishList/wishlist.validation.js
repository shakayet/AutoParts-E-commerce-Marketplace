"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistValidation = void 0;
const zod_1 = require("zod");
exports.WishlistValidation = {
    addToWishlist: zod_1.z.object({
        body: zod_1.z.object({
            productId: zod_1.z.string({ required_error: 'Product ID is required' }),
        }),
    }),
    getWishlist: zod_1.z.object({
        query: zod_1.z.object({
            page: zod_1.z.string().optional(),
            limit: zod_1.z.string().optional(),
            sortBy: zod_1.z.string().optional(),
            sortOrder: zod_1.z.string().optional(),
        }),
    }),
    removeFromWishlist: zod_1.z.object({
        params: zod_1.z.object({
            productId: zod_1.z.string({ required_error: 'Product ID is required' }),
        }),
    }),
};
//# sourceMappingURL=wishlist.validation.js.map