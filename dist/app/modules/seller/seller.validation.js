"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerValidation = void 0;
const zod_1 = require("zod");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const getSellerLocationZodSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z
            .string({ required_error: 'Seller id is required' })
            .regex(objectIdRegex, 'Invalid seller id format'),
    }),
});
exports.SellerValidation = { getSellerLocationZodSchema };
