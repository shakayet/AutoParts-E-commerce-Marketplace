import express from 'express';
import auth from '../../middlewares/auth';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route('/top-reviews').get(ReviewController.getTopReviews);

router
  .route('/:productId')
  .get(
    validateRequest(ReviewValidation.getReviewsZodSchema),
    ReviewController.getReviews,
  );

router
  .route('/product/:productId')
  .get(
    validateRequest(ReviewValidation.getReviewsZodSchema),
    ReviewController.getReviews,
  );

router
  .route('/')
  .post(
    auth(USER_ROLES.USER),
    validateRequest(ReviewValidation.createReviewZodSchema),
    ReviewController.createReview,
  );

export const ReviewRoutes = router;
