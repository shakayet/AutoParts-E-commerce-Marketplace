/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { CategoryRequestController } from './categoryRequest.controller';
import { CategoryRequestValidation } from './categoryRequest.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    CategoryRequestController.getCategoryRequests,
  )
  .post(
    auth(USER_ROLES.USER),
    validateRequest(CategoryRequestValidation.createCategoryRequestZodSchema),
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