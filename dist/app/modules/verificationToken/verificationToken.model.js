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
verificationTokenSchema.statics.isValidOtp = function (userId, otp) {
    return __awaiter(this, void 0, void 0, function* () {
        const record = yield exports.VerificationToken.findOne({ user: userId, otp, expireAt: { $gt: new Date() } });
        return !!record;
    });
};
exports.VerificationToken = (0, mongoose_1.model)('VerificationToken', verificationTokenSchema);
