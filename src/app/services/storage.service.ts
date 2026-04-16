/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import sharp from 'sharp';
import crypto from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_REGION });

class StorageService {
  static async uploadLocalFile(localPath: string): Promise<string> {
    const buffer = await fsp.readFile(localPath);

    const ext = path.extname(localPath).toLowerCase();
    let uploadBuffer: Buffer = buffer;
    let contentType = 'application/octet-stream';

    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      uploadBuffer = await sharp(buffer)
        .resize({ width: 1024, withoutEnlargement: true })
        .toFormat('webp')
        .toBuffer();
      contentType = 'image/webp';
    } else if (ext === '.webp') {
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

    const key = `uploads/${crypto.randomUUID()}${
      ext === '.jpg' || ext === '.jpeg' || ext === '.png' ? '.webp' : ext
    }`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET!,
        Key: key,
        Body: uploadBuffer,
        ContentType: contentType,
      }),
    );

    try {
      await fsp.unlink(localPath);
    } catch {
      // ignore
    }

    const domain = process.env.CLOUDFRONT_DOMAIN || '';
    return `${domain.replace(/\/+$/g, '')}/${key}`;
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
