/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import ApiError from '../../errors/ApiError';
import process from 'process';

const fileUploadHandler = () => {
  //create upload folder
  const baseUploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  //folder create for different file
  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  //create filename
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      switch (file.fieldname) {
        case 'image':
          uploadDir = path.join(baseUploadDir, 'image');
          break;
        case 'icon':
          uploadDir = path.join(baseUploadDir, 'image');
          break;
        case 'mainImage':
          uploadDir = path.join(baseUploadDir, 'image');
          break;
        case 'galleryImages':
          uploadDir = path.join(baseUploadDir, 'image');
          break;
        case 'media':
          uploadDir = path.join(baseUploadDir, 'media');
          break;
        case 'doc':
          uploadDir = path.join(baseUploadDir, 'doc');
          break;
        default:
          throw new ApiError(StatusCodes.BAD_REQUEST, 'File is not supported');
      }
      createDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, '')
          .toLowerCase()
          .split(' ')
          .join('-') +
        '-' +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });

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
    if (
      file.fieldname === 'image' ||
      file.fieldname === 'icon' ||
      file.fieldname === 'mainImage' ||
      file.fieldname === 'galleryImages'
    ) {
      if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg'
      ) {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .jpeg, .png, .jpg file supported',
          ),
        );
      }
    } else if (file.fieldname === 'media') {
      if (file.mimetype === 'video/mp4' || file.mimetype === 'audio/mpeg') {
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
      if (file.mimetype === 'application/pdf') {
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
  }).fields([
    { name: 'image', maxCount: 6 },
    { name: 'icon', maxCount: 1 },
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 6 },
    { name: 'media', maxCount: 3 },
    { name: 'doc', maxCount: 3 },
  ]);

  // wrap multer middleware in a function that will process files after
  // they have been written to disk.  The processing step uploads every
  // file to S3 (optimising images) and attaches a `url` field so that
  // downstream handlers can remain unaware of the storage details.
  const wrapped = (req: any, res: any, next: any) => {
    upload(req, res, async (err: any) => {
      if (err) {
        return next(err);
      }

      if (req.files) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const StorageService = require('../services/storage.service').default;
        const files = req.files as Record<string, Express.Multer.File[]>;
        for (const field of Object.keys(files)) {
          const arr = files[field];
          if (!arr) continue;
          for (const file of arr) {
            try {
              // multer.diskStorage attaches a `path` property
              const localPath = (file as any).path;
              if (localPath) {
                const url = await StorageService.uploadLocalFile(localPath);
                (file as any).url = url;
              }
            } catch (uploadErr) {
              // if uploading fails we propagate the error
              return next(uploadErr);
            }
          }
        }
      }

      next();
    });
  };

  return wrapped;
};

export default fileUploadHandler;
