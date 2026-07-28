"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const crypto_1 = __importDefault(require("crypto"));
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const heicConvert = require('heic-convert');
const client_s3_1 = require("@aws-sdk/client-s3");
const s3 = new client_s3_1.S3Client({ region: process.env.AWS_REGION });
class StorageService {
    /**
     * Upload a file directly from an in-memory buffer (no disk I/O).
     * This is the preferred method for the async upload pipeline.
     */
    static uploadBuffer(buffer, originalName) {
        return __awaiter(this, void 0, void 0, function* () {
            const ext = path_1.default.extname(originalName).toLowerCase();
            let uploadBuffer = buffer;
            let contentType = 'application/octet-stream';
            const isHeic = ext === '.heic' || ext === '.heif';
            const isConvertibleImage = ['.jpg', '.jpeg', '.png'].includes(ext) || isHeic;
            // Handle HEIC/HEIF conversion before sharp processing
            // sharp often lacks built-in HEIF support on some environments
            if (isHeic) {
                try {
                    const converted = yield heicConvert({
                        buffer: uploadBuffer,
                        format: 'JPEG',
                        quality: 1,
                    });
                    uploadBuffer = Buffer.from(converted);
                }
                catch (error) {
                    console.error('HEIC conversion failed:', error);
                    throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Failed to process HEIC image: ${error.message || 'Unknown error'}`);
                }
            }
            if (isConvertibleImage) {
                uploadBuffer = yield (0, sharp_1.default)(uploadBuffer)
                    .resize({ width: 1024, withoutEnlargement: true })
                    .toFormat('webp')
                    .toBuffer();
                contentType = 'image/webp';
            }
            else if (ext === '.webp') {
                uploadBuffer = yield (0, sharp_1.default)(uploadBuffer)
                    .resize({ width: 1024, withoutEnlargement: true })
                    .toBuffer();
                contentType = 'image/webp';
            }
            else if (ext === '.pdf') {
                contentType = 'application/pdf';
            }
            else if (ext === '.mp4') {
                contentType = 'video/mp4';
            }
            else if (ext === '.mp3') {
                contentType = 'audio/mpeg';
            }
            const key = `uploads/${crypto_1.default.randomUUID()}${isConvertibleImage ? '.webp' : ext}`;
            yield s3.send(new client_s3_1.PutObjectCommand({
                Bucket: process.env.AWS_BUCKET,
                Key: key,
                Body: uploadBuffer,
                ContentType: contentType,
            }));
            const domain = process.env.CLOUDFRONT_DOMAIN || '';
            return `${domain.replace(/\/+$/g, '')}/${key}`;
        });
    }
    /**
     * Legacy method — reads from local disk, uploads to S3, deletes local file.
     * Kept for backward compatibility.
     */
    static uploadLocalFile(localPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = yield fs_1.promises.readFile(localPath);
            const originalName = path_1.default.basename(localPath);
            const url = yield StorageService.uploadBuffer(buffer, originalName);
            try {
                yield fs_1.promises.unlink(localPath);
            }
            catch (_a) {
                // ignore
            }
            return url;
        });
    }
    static deleteByUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!url)
                return;
            const domain = process.env.CLOUDFRONT_DOMAIN || '';
            let key = url;
            if (domain && url.includes(domain)) {
                key = url.split(domain)[1];
            }
            key = key.replace(/^\//, '');
            if (!key)
                return;
            yield s3.send(new client_s3_1.DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET,
                Key: key,
            }));
        });
    }
}
exports.default = StorageService;
