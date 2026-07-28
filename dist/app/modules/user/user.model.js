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
exports.User = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../../../config"));
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(user_1.USER_ROLES),
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    image: {
        type: String,
        default: 'https://i.ibb.co/z5YHLV9/profile.png',
    },
    whatsappNumber: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    coordinates: {
        type: {
            lat: { type: Number },
            lng: { type: Number },
        },
        required: false,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    ratingsCount: {
        type: Number,
        default: 0,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['active', 'banned'],
        default: 'active',
    },
    verified: {
        type: Boolean,
        default: false,
    },
    authentication: {
        type: {
            isResetPassword: {
                type: Boolean,
                default: false,
            },
            oneTimeCode: {
                type: Number,
                default: null,
            },
            expireAt: {
                type: Date,
                default: null,
            },
        },
    },
}, { timestamps: true });
//exist user check
userSchema.statics.isExistUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield exports.User.findById(id);
    return isExist;
});
userSchema.statics.isExistUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield exports.User.findOne({ email });
    return isExist;
});
//is match password
userSchema.statics.isMatchPassword = (password, hashPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.compare(password, hashPassword);
});
//check user
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // only run on new documents or when email/password is modified
        if (this.isNew || this.isModified('email') || this.isModified('password')) {
            // check duplicate email (exclude self when updating)
            const exists = yield exports.User.findOne({ email: this.email });
            if (exists &&
                (!this._id || exists._id.toString() !== this._id.toString())) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email already exist!');
            }
            // hash password if modified
            if (this.isModified('password') && this.password) {
                this.password = yield bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
            }
        }
        next();
    });
});
exports.User = (0, mongoose_1.model)('User', userSchema);
