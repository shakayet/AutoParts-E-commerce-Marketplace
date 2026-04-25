/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { CategoryRequestController } from './categoryRequest.controller';
import { CategoryRequestValidation } from './categoryRequest.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { getSingleFilePath } from '../../../shared/getFilePath';

const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    CategoryRequestController.getCategoryRequests,
  )
  .post(
    auth(USER_ROLES.USER),
    fileUploadHandler(),
    (req, res, next) => {
      if (req.body.data) {
        req.body = { ...JSON.parse(req.body.data) };
      }
      const image = getSingleFilePath((req as any).files, 'image');
      if (image) req.body.image = image;

      CategoryRequestValidation.createCategoryRequestZodSchema.parse({
        body: req.body,
      });
      next();
    },
    CategoryRequestController.createCategoryRequest,
  );

router
  .route('/:id')
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(CategoryRequestValidation.reviewCategoryRequestZodSchema),
    CategoryRequestController.reviewCategoryRequest,
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    CategoryRequestController.deleteCategoryRequest,
  );

export const CategoryRequestRoutes = router;
