import express from 'express';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

router
	.route('/')
	.get(CategoryController.getCategories)
	.post(auth('admin'), validateRequest(CategoryValidation.createCategoryZodSchema), CategoryController.createCategory);

router
	.route('/:id')
	.patch(auth('admin'), validateRequest(CategoryValidation.updateCategoryZodSchema), CategoryController.updateCategory)
	.delete(auth('admin'), CategoryController.deleteCategory);

// requests
router
	.route('/request')
	.post(auth(), validateRequest(CategoryValidation.createCategoryRequestZodSchema), CategoryController.createCategoryRequest)
	.get(auth('admin'), CategoryController.getCategoryRequests);

router
	.route('/request/:id/review')
	.patch(auth('admin'), validateRequest(CategoryValidation.reviewCategoryRequestZodSchema), CategoryController.reviewCategoryRequest);

export const CategoryRoutes = router;
