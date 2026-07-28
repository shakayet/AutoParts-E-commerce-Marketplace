"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
const config_1 = __importDefault(require("../../config"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const heicConvert = require('heic-convert');
const client_s3_1 = require("@aws-sdk/client-s3");
const createS3Client = () => {
    return new client_s3_1.S3Client({
        region: config_1.default.aws.region,
        credentials: config_1.default.aws.accessKeyId && config_1.default.aws.secretAccessKey
            ? {
                accessKeyId: config_1.default.aws.accessKeyId,
                secretAccessKey: config_1.default.aws.secretAccessKey,
            }
            : undefined,
    });
};
let s3Client = null;
const getS3Client = () => {
    if (!s3Client) {
        s3Client = createS3Client();
    }
    return s3Client;
};
class StorageService {
    /**
     * Upload a file directly from an in-memory buffer (no disk I/O).
     * This is the preferred method for the async upload pipeline.
     */
    static async uploadBuffer(buffer, originalName) {
        const ext = path_1.default.extname(originalName).toLowerCase();
        let uploadBuffer = buffer;
        let contentType = 'application/octet-stream';
        const isHeic = ext === '.heic' || ext === '.heif';
        const isConvertibleImage = ['.jpg', '.jpeg', '.png'].includes(ext) || isHeic;
        // Handle HEIC/HEIF conversion before sharp processing
        // sharp often lacks built-in HEIF support on some environments
        if (isHeic) {
            try {
                const converted = await heicConvert({
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
            uploadBuffer = await (0, sharp_1.default)(uploadBuffer)
                .resize({ width: 1024, withoutEnlargement: true })
                .toFormat('webp')
                .toBuffer();
            contentType = 'image/webp';
        }
        else if (ext === '.webp') {
            uploadBuffer = await (0, sharp_1.default)(uploadBuffer)
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
        const s3 = getS3Client();
        await s3.send(new client_s3_1.PutObjectCommand({
            Bucket: config_1.default.aws.bucket,
            Key: key,
            Body: uploadBuffer,
            ContentType: contentType,
        }));
        const domain = config_1.default.aws.cloudFrontDomain || '';
        return `${domain.replace(/\/+$/g, '')}/${key}`;
    }
    /**
     * Legacy method — reads from local disk, uploads to S3, deletes local file.
     * Kept for backward compatibility.
     */
    static async uploadLocalFile(localPath) {
        const buffer = await fs_1.promises.readFile(localPath);
        const originalName = path_1.default.basename(localPath);
        const url = await StorageService.uploadBuffer(buffer, originalName);
        try {
            await fs_1.promises.unlink(localPath);
        }
        catch {
            // ignore
        }
        return url;
    }
    static async deleteByUrl(url) {
        if (!url)
            return;
        const domain = config_1.default.aws.cloudFrontDomain || '';
        let key = url;
        if (domain && url.includes(domain)) {
            key = url.split(domain)[1];
        }
        key = key.replace(/^\//, '');
        if (!key)
            return;
        const s3 = getS3Client();
        await s3.send(new client_s3_1.DeleteObjectCommand({
            Bucket: config_1.default.aws.bucket,
            Key: key,
        }));
    }
}
exports.default = StorageService;
//# sourceMappingURL=storage.service.js.map