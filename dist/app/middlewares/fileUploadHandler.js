"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const multer_1 = __importDefault(require("multer"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const fileUploadHandler = () => {
    // Use memory storage — files stay in RAM as buffers,
    // no disk I/O needed before uploading to S3.
    const storage = multer_1.default.memoryStorage();
    //file filter
    const filterFilter = (req, file, cb) => {
        const mimetype = file.mimetype.toLowerCase();
        if (file.fieldname === 'image' ||
            file.fieldname === 'icon' ||
            file.fieldname === 'mainImage' ||
            file.fieldname === 'galleryImages') {
            if (mimetype === 'image/jpeg' ||
                mimetype === 'image/png' ||
                mimetype === 'image/jpg' ||
                mimetype === 'image/heic' ||
                mimetype === 'image/heif' ||
                mimetype === 'image/webp') {
                cb(null, true);
            }
            else {
                cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only .jpeg, .png, .jpg, .heic, .heif, .webp file supported'));
            }
        }
        else if (file.fieldname === 'media') {
            if (mimetype === 'video/mp4' || mimetype === 'audio/mpeg') {
                cb(null, true);
            }
            else {
                cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only .mp4, .mp3, file supported'));
            }
        }
        else if (file.fieldname === 'doc') {
            if (mimetype === 'application/pdf') {
                cb(null, true);
            }
            else {
                cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only pdf supported'));
            }
        }
        else {
            cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'This file is not supported'));
        }
    };
    const upload = (0, multer_1.default)({
        storage: storage,
        fileFilter: filterFilter,
        limits: {
            fileSize: 10 * 1024 * 1024, // 10 MB per file
        },
    }).fields([
        { name: 'image', maxCount: 6 },
        { name: 'icon', maxCount: 1 },
        { name: 'mainImage', maxCount: 1 },
        { name: 'galleryImages', maxCount: 6 },
        { name: 'media', maxCount: 3 },
        { name: 'doc', maxCount: 3 },
    ]);
    // Wrap multer middleware: after files are parsed into memory buffers,
    // upload ALL files to S3 in parallel using Promise.all().
    const wrapped = (req, res, next) => {
        upload(req, res, async (err) => {
            if (err) {
                return next(err);
            }
            if (req.files) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const StorageService = require('../services/storage.service').default;
                const files = req.files;
                // Collect all upload promises across all fields
                const uploadPromises = [];
                for (const field of Object.keys(files)) {
                    const arr = files[field];
                    if (!arr)
                        continue;
                    for (const file of arr) {
                        uploadPromises.push((async () => {
                            try {
                                // memoryStorage attaches a `buffer` property
                                const buffer = file.buffer;
                                if (buffer) {
                                    const url = await StorageService.uploadBuffer(buffer, file.originalname);
                                    file.url = url;
                                }
                            }
                            catch (uploadErr) {
                                throw uploadErr;
                            }
                        })());
                    }
                }
                try {
                    // Upload all files in parallel
                    await Promise.all(uploadPromises);
                }
                catch (uploadErr) {
                    return next(uploadErr);
                }
            }
            next();
        });
    };
    return wrapped;
};
exports.default = fileUploadHandler;
//# sourceMappingURL=fileUploadHandler.js.map