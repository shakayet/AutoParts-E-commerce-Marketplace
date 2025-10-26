import express from 'express';
import { WishlistController } from './wishlist.controller';
import validateRequest from '../../middlewares/validateRequest';
import { WishlistValidation } from './wishlist.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
  .route('/')
  .get(auth(USER_ROLES.USER), WishlistController.getWishlist)
  .post(
    auth(USER_ROLES.USER),
    validateRequest(WishlistValidation.addToWishlist),
    WishlistController.addToWishlist
  );

router
  .route('/:productId')
  .delete(
    auth(USER_ROLES.USER),
    validateRequest(WishlistValidation.removeFromWishlist),
    WishlistController.removeFromWishlist
  );

export const WishlistRoutes = router;
