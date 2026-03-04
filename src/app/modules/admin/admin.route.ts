import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { AdminController } from './admin.controller';

const router = express.Router();

router.get(
  '/top-products',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminController.getTopProducts,
);

router.get(
  '/category-summary',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminController.getCategorySummary,
);

router.get(
  '/products',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminController.getProducts,
);

router.get(
  '/products/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminController.getProduct,
);

export const AdminRoutes = router;
