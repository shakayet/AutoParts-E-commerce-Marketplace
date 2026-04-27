/* eslint-disable no-useless-catch */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import ApiError from '../../errors/ApiError';

const fileUploadHandler = () => {
  // Use memory storage — files stay in RAM as buffers,
  // no disk I/O needed before uploading to S3.
  const storage = multer.memoryStorage();

  type MulterFile = {
    fieldname: string;
    originalname: string;
    filename: string;
    mimetype: string;
  };

  //file filter
  const filterFilter = (
    req: Request,
    file: MulterFile,
    cb: FileFilterCallback,
  ) => {
    const mimetype = file.mimetype.toLowerCase();
    if (
      file.fieldname === 'image' ||
      file.fieldname === 'icon' ||
      file.fieldname === 'mainImage' ||
      file.fieldname === 'galleryImages'
    ) {
      if (
        mimetype === 'image/jpeg' ||
        mimetype === 'image/png' ||
        mimetype === 'image/jpg' ||
        mimetype === 'image/heic' ||
        mimetype === 'image/heif' ||
        mimetype === 'image/webp'
      ) {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .jpeg, .png, .jpg, .heic, .heif, .webp file supported',
          ),
        );
      }
    } else if (file.fieldname === 'media') {
      if (mimetype === 'video/mp4' || mimetype === 'audio/mpeg') {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .mp4, .mp3, file supported',
          ),
        );
      }
    } else if (file.fieldname === 'doc') {
      if (mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only pdf supported'));
      }
    } else {
      cb(new ApiError(StatusCodes.BAD_REQUEST, 'This file is not supported'));
    }
  };

  const upload = multer({
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
  const wrapped = (req: any, res: any, next: any) => {
    upload(req, res, async (err: any) => {
      if (err) {
        return next(err);
      }

      if (req.files) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const StorageService = require('../services/storage.service').default;
        const files = req.files as Record<string, Express.Multer.File[]>;

        // Collect all upload promises across all fields
        const uploadPromises: Promise<void>[] = [];

        for (const field of Object.keys(files)) {
          const arr = files[field];
          if (!arr) continue;
          for (const file of arr) {
            uploadPromises.push(
              (async () => {
                try {
                  // memoryStorage attaches a `buffer` property
                  const buffer = (file as any).buffer as Buffer;
                  if (buffer) {
                    const url = await StorageService.uploadBuffer(
                      buffer,
                      file.originalname,
                    );
                    (file as any).url = url;
                  }
                } catch (uploadErr) {
                  throw uploadErr;
                }
              })(),
            );
          }
        }

        try {
          // Upload all files in parallel
          await Promise.all(uploadPromises);
        } catch (uploadErr) {
          return next(uploadErr);
        }
      }

      next();
    });
  };

  return wrapped;
};

export default fileUploadHandler;
