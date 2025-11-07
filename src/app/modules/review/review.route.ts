import express from 'express';
import auth from '../../middlewares/auth';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route('/:productId').get(ReviewController.getReviews);

router
  .route('/')
  .post(
    auth(USER_ROLES.USER),
    validateRequest(ReviewValidation.createReviewZodSchema),
    ReviewController.createReview
  );

router
  .route('/product/:productId')
  .get(
    ReviewController.getSingleProductReview
  );

router
  .route('/:id')
  .delete(auth(USER_ROLES.USER), ReviewController.deleteReview);

export const ReviewRoutes = router;
