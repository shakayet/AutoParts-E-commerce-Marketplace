/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { NextFunction, Request, Response } from 'express';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { getSingleFilePath } from '../../../shared/getFilePath';

const router = express.Router();

router
  .route('/')
  .get(CategoryController.getCategories)
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    fileUploadHandler(), // multer middleware
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = {
          ...JSON.parse(req.body.data),
        };
      }

      const imagePath = getSingleFilePath((req as any).files, 'image');
      if (imagePath) {
        req.body.image = imagePath;
        req.body.icon = imagePath;
      }

      return CategoryController.createCategory(req, res, next);
    }
  );

router
  .route('/:id')
  .get(CategoryController.getSingleCategory)
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = CategoryValidation.updateCategoryZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }

      const imagePath = getSingleFilePath((req as any).files, 'image');
      if (imagePath) {
        req.body.image = imagePath;
        req.body.icon = imagePath;
      }

      return CategoryController.updateCategory(req, res, next);
    }
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    CategoryController.deleteCategory
  );

// requests
router
  .route('/request')
  .post(
    auth(USER_ROLES.USER),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = CategoryValidation.createCategoryRequestZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      if (req.file) {
        req.body.icon = req.file.path;
      }
      return CategoryController.createCategoryRequest(req, res, next);
    }
  )
  .get(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    CategoryController.getCategoryRequests
  );

router
  .route('/request/:id/review')
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(CategoryValidation.reviewCategoryRequestZodSchema),
    CategoryController.reviewCategoryRequest
  );

export const CategoryRoutes = router;
