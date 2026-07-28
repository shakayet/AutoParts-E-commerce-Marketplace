"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const process_1 = __importDefault(require("process"));
dotenv_1.default.config({ path: path_1.default.join(process_1.default.cwd(), '.env') });
exports.default = {
    ip_address: process_1.default.env.IP_ADDRESS,
    database_url: process_1.default.env.DATABASE_URL,
    node_env: process_1.default.env.NODE_ENV,
    port: process_1.default.env.PORT,
    bcrypt_salt_rounds: process_1.default.env.BCRYPT_SALT_ROUNDS,
    jwt: {
        jwt_secret: process_1.default.env.JWT_SECRET,
        jwt_expire_in: process_1.default.env.JWT_EXPIRE_IN,
        refresh_secret: process_1.default.env.JWT_REFRESH_SECRET || process_1.default.env.JWT_SECRET,
        refresh_expire_in: process_1.default.env.JWT_REFRESH_EXPIRE_IN || process_1.default.env.JWT_EXPIRE_IN,
    },
    email: {
        from: process_1.default.env.EMAIL_FROM,
        fromName: process_1.default.env.EMAIL_FROM_NAME || 'Jbay',
    },
    aws: {
        region: process_1.default.env.AWS_REGION || 'us-east-1',
        accessKeyId: process_1.default.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process_1.default.env.AWS_SECRET_ACCESS_KEY,
    },
    branding: {
        logoUrl: process_1.default.env.BRAND_LOGO_URL,
        projectName: process_1.default.env.PROJECT_NAME || 'JBAY',
    },
    super_admin: {
        email: process_1.default.env.SUPER_ADMIN_EMAIL,
        password: process_1.default.env.SUPER_ADMIN_PASSWORD,
    },
    rateLimit: {
        windowMs: parseInt(process_1.default.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        max: parseInt(process_1.default.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
        message: process_1.default.env.RATE_LIMIT_MESSAGE || 'Too many requests from this IP, please try again later.',
    },
};
