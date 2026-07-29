"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const http_status_codes_1 = require("http-status-codes");
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const rateLimiter_1 = __importDefault(require("./app/middlewares/rateLimiter"));
const routes_1 = __importDefault(require("./routes"));
const morgen_1 = require("./shared/morgen");
const config_1 = __importDefault(require("./config"));
const mongoose_1 = __importDefault(require("mongoose"));
const app = (0, express_1.default)();
// Trust the first reverse proxy (Nginx)
app.set('trust proxy', 1);
//morgan
app.use(morgen_1.Morgan.successHandler);
app.use(morgen_1.Morgan.errorHandler);
// Helmet for security headers
app.use((0, helmet_1.default)());
// Apply rate limiter to all requests
app.use(rateLimiter_1.default);
//body parser
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin ||
            config_1.default.corsOrigins.includes('*') ||
            config_1.default.corsOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Origin is not allowed by CORS'));
    },
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// file retrieval is handled by CloudFront; we no longer serve from local uploads directory
//router
app.use('/api/v1', routes_1.default);
//live response
app.get('/', (req, res) => {
    const date = new Date(Date.now());
    res.send(`<h1 style="text-align:center; color:#173616; font-family:Verdana;">Beep-beep! The server is alive and kicking.</h1>
    <p style="text-align:center; color:#173616; font-family:Verdana;">${date}</p>
    `);
});
app.get('/health', (_req, res) => {
    const ready = mongoose_1.default.connection.readyState === 1;
    res.status(ready ? http_status_codes_1.StatusCodes.OK : http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE).json({
        success: ready,
        message: ready ? 'Service is healthy' : 'Service is not ready',
    });
});
//global error handle
app.use(globalErrorHandler_1.default);
//handle not found route;
app.use((req, res) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Not found',
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API DOESN'T EXIST",
            },
        ],
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map