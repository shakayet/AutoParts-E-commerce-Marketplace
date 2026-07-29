"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const createUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        whatsappNumber: zod_1.z.string().optional(),
        contact: zod_1.z.string().optional(),
        email: zod_1.z.string({ required_error: 'Email is required' }),
        password: zod_1.z.string({ required_error: 'Password is required' }).min(8),
        location: zod_1.z.string().optional(),
        profile: zod_1.z.string().optional(),
    }),
});
const updateUserZodSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    contact: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
});
const changePasswordZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        oldPassword: zod_1.z.string({ required_error: 'Old password is required' }),
        newPassword: zod_1.z
            .string({ required_error: 'New password is required' })
            .min(8),
    }),
});
const blockUnblockZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        block: zod_1.z.boolean({ required_error: 'Block flag is required' }),
    }),
});
const deleteAccountZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string({ required_error: 'Password is required' }),
    }),
});
exports.UserValidation = {
    createUserZodSchema,
    updateUserZodSchema,
    changePasswordZodSchema,
    blockUnblockZodSchema,
    deleteAccountZodSchema,
};
//# sourceMappingURL=user.validation.js.map