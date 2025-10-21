import express from 'express';
import auth from '../../middlewares/auth';
import { NotificationController } from './notification.controller';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route('/').get(auth(USER_ROLES.USER, USER_ROLES.ADMIN), NotificationController.getNotifications);
router.route('/:id/read').patch(auth(USER_ROLES.USER, USER_ROLES.ADMIN), NotificationController.markRead);
router.route('/read/all').patch(auth(USER_ROLES.USER, USER_ROLES.ADMIN), NotificationController.markAllRead);
router.route('/read').patch(auth(USER_ROLES.USER, USER_ROLES.ADMIN), NotificationController.markMultipleRead);
router.route('/count').get(auth(USER_ROLES.USER, USER_ROLES.ADMIN), NotificationController.getUnreadCount);
router.route('/:id').delete(auth(USER_ROLES.USER, USER_ROLES.ADMIN), NotificationController.deleteNotification);

export const NotificationRoutes = router;
