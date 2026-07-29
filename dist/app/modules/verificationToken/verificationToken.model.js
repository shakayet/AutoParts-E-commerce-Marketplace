"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationToken = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const verificationTokenSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    otp: { type: Number, required: true },
    expireAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
}, { timestamps: true });
verificationTokenSchema.statics.isValidOtp = async function (userId, otp) {
    const record = await exports.VerificationToken.findOne({
        user: userId,
        otp,
        expireAt: { $gt: new Date() },
    });
    return !!record;
};
exports.VerificationToken = (0, mongoose_1.model)('VerificationToken', verificationTokenSchema);
//# sourceMappingURL=verificationToken.model.js.map