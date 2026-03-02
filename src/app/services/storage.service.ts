/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import sharp from 'sharp';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
// uuid package is published as ESM; use require to avoid jest transform issues
const { v4: uuidv4 } = require('uuid');

const s3 = new S3Client({ region: process.env.AWS_REGION });

/**
 * Utility service that handles file uploads/deletions to AWS S3 and
 * applies image-specific preprocessing (resize/compress/format).
 * Consumer middleware/controllers should call `uploadLocalFile` after
 * multer has written a file to disk. The returned string will be a
 * CloudFront‑prefixed URL that can safely be persisted in the database.
 */
class StorageService {
  static async uploadLocalFile(localPath: string): Promise<string> {
    // read the file from disk
    const buffer = await fsp.readFile(localPath);

    // determine extension & content type
    const ext = path.extname(localPath).toLowerCase();
    let uploadBuffer: Buffer = buffer;
    let contentType = 'application/octet-stream';

    // perform image optimisation for common image types
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      uploadBuffer = await sharp(buffer)
        .resize({ width: 1024, withoutEnlargement: true })
        .toFormat('webp')
        .toBuffer();
      contentType = 'image/webp';
    } else if (ext === '.webp') {
      // already webp, we can still optionally resize
      uploadBuffer = await sharp(buffer)
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

    const key = `uploads/${uuidv4()}${ext === '.jpg' || ext === '.jpeg' || ext === '.png' ? '.webp' : ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET!,
        Key: key,
        Body: uploadBuffer,
        ContentType: contentType,
      }),
    );

    // remove local file so that uploads directory doesn't fill up
    try {
      await fsp.unlink(localPath);
    } catch {
      // swallow errors silently; file might have already been removed
    }

    // return CloudFront URL
    const domain = process.env.CLOUDFRONT_DOMAIN || '';
    return `${domain.replace(/\/+$/g, '')}/${key}`;
  }

  static async deleteByUrl(url: string): Promise<void> {
    if (!url) return;
    // strip domain if included
    const domain = process.env.CLOUDFRONT_DOMAIN || '';
    let key = url;
    if (domain && url.includes(domain)) {
      key = url.split(domain)[1];
    }
    // trim leading slash
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
