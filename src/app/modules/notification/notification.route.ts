import express from 'express';
import auth from '../../middlewares/auth';
import { NotificationController } from './notification.controller';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NotificationController.getNotifications
  );
router
  .route('/:id/read')
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NotificationController.markRead
  );
router
  .route('/read/all')
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NotificationController.markAllRead
  );
router
  .route('/:id')
  .delete(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NotificationController.deleteNotification
  );

export const NotificationRoutes = router;
