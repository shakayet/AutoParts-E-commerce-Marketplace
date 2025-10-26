/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { NotificationService } from './notification.service';
import { StatusCodes } from 'http-status-codes';

const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const { page, limit, isRead } = req.query as any;
  const opts: any = {};
  if (page) opts.page = Number(page);
  if (limit) opts.limit = Number(limit);
  if (isRead !== undefined) opts.isRead = isRead === 'true';
  const result = await NotificationService.getNotificationsForUser(
    user.id,
    opts
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notifications retrieved successfully',
    data: result,
  });
});

const markRead = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const { id } = req.params;
  const result = await NotificationService.markAsRead(id, user.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification marked as read',
    data: result,
  });
});

const markAllRead = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const result = await NotificationService.markAllAsRead(user.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All notifications marked as read',
    data: result,
  });
});


const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const { id } = req.params;
  const result = await NotificationService.deleteNotification(id, user.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification deleted',
    data: result,
  });
});

export const NotificationController = {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
};
