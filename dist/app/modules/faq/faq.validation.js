"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQValidation = void 0;
const zod_1 = require("zod");
const createFAQZodSchema = zod_1.z.object({
    question: zod_1.z.string({ required_error: 'Question is required' }),
    answer: zod_1.z.string({ required_error: 'Answer is required' }),
    image: zod_1.z.string().optional(),
});
const updateFAQZodSchema = zod_1.z.object({
    question: zod_1.z.string().optional(),
    answer: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
});
exports.FAQValidation = { createFAQZodSchema, updateFAQZodSchema };
