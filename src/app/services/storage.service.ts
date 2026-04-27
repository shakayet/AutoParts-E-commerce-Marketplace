/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import sharp from 'sharp';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../errors/ApiError';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const heicConvert = require('heic-convert');
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_REGION });

class StorageService {
  /**
   * Upload a file directly from an in-memory buffer (no disk I/O).
   * This is the preferred method for the async upload pipeline.
   */
  static async uploadBuffer(
    buffer: Buffer,
    originalName: string,
  ): Promise<string> {
    const ext = path.extname(originalName).toLowerCase();
    let uploadBuffer: Buffer = buffer;
    let contentType = 'application/octet-stream';

    const isHeic = ext === '.heic' || ext === '.heif';
    const isConvertibleImage =
      ['.jpg', '.jpeg', '.png'].includes(ext) || isHeic;

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
      } catch (error: any) {
        console.error('HEIC conversion failed:', error);
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Failed to process HEIC image: ${error.message || 'Unknown error'}`,
        );
      }
    }

    if (isConvertibleImage) {
      uploadBuffer = await sharp(uploadBuffer)
        .resize({ width: 1024, withoutEnlargement: true })
        .toFormat('webp')
        .toBuffer();
      contentType = 'image/webp';
    } else if (ext === '.webp') {
      uploadBuffer = await sharp(uploadBuffer)
        .resize({ width: 1024, withoutEnlargement: true })
        .toBuffer();
      contentType = 'image/webp';
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.mp4') {
      contentType = 'video/mp4';
    } else if (ext === '.mp3') {
      contentType = 'audio/mpeg';
    }

    const key = `uploads/${crypto.randomUUID()}${
      isConvertibleImage ? '.webp' : ext
    }`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET!,
        Key: key,
        Body: uploadBuffer,
        ContentType: contentType,
      }),
    );

    const domain = process.env.CLOUDFRONT_DOMAIN || '';
    return `${domain.replace(/\/+$/g, '')}/${key}`;
  }

  /**
   * Legacy method — reads from local disk, uploads to S3, deletes local file.
   * Kept for backward compatibility.
   */
  static async uploadLocalFile(localPath: string): Promise<string> {
    const buffer = await fsp.readFile(localPath);
    const originalName = path.basename(localPath);
    const url = await StorageService.uploadBuffer(buffer, originalName);

    try {
      await fsp.unlink(localPath);
    } catch {
      // ignore
    }

    return url;
  }

  static async deleteByUrl(url: string): Promise<void> {
    if (!url) return;

    const domain = process.env.CLOUDFRONT_DOMAIN || '';
    let key = url;

    if (domain && url.includes(domain)) {
      key = url.split(domain)[1];
    }

    key = key.replace(/^\//, '');
    if (!key) return;

    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET!,
        Key: key,
      }),
    );
  }
}

export default StorageService;
