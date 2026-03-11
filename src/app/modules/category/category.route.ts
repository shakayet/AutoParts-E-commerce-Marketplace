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
  .get(
    validateRequest(CategoryValidation.getCategoriesZodSchema),
    CategoryController.getCategories,
  )
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    fileUploadHandler(), // multer middleware
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = {
          ...JSON.parse(req.body.data),
        };
      }

      const iconPath = getSingleFilePath((req as any).files, 'icon');
      if (iconPath) {
        req.body.icon = iconPath;
      }

      return CategoryController.createCategory(req, res, next);
    },
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
          JSON.parse(req.body.data),
        );
      }

      const imagePath = getSingleFilePath((req as any).files, 'image');
      if (imagePath) {
        req.body.image = imagePath;
        req.body.icon = imagePath;
      }

      return CategoryController.updateCategory(req, res, next);
    },
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    CategoryController.deleteCategory,
  );

export const CategoryRoutes = router;
