import express from 'express';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
	.route('/')
	.get(CategoryController.getCategories)
	.post(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(CategoryValidation.createCategoryZodSchema), CategoryController.createCategory);

router
	.route('/:id')
	.get(CategoryController.getSingleCategory)
	.patch(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(CategoryValidation.updateCategoryZodSchema), CategoryController.updateCategory)
	.delete(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), CategoryController.deleteCategory);

// requests
router
	.route('/request')
	.post(auth(USER_ROLES.USER), validateRequest(CategoryValidation.createCategoryRequestZodSchema), CategoryController.createCategoryRequest)
	.get(auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), CategoryController.getCategoryRequests);

router
	.route('/request/:id/review')
	.patch(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(CategoryValidation.reviewCategoryRequestZodSchema), CategoryController.reviewCategoryRequest);

export const CategoryRoutes = router;
