/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { error } from 'console';
import { Notification } from './notification.model';

type FetchOptions = { page?: number; limit?: number; isRead?: boolean };

const getNotificationsForUser = async (
  userId: string,
  opts: FetchOptions = {}
) => {
  const page = Math.max(1, opts.page || 1);
  const limit = Math.min(100, opts.limit || 20);
  const skip = (page - 1) * limit;
  const q: any = { user: userId };
  if (typeof opts.isRead === 'boolean') q.isRead = opts.isRead;

  const [items, total] = await Promise.all([
    Notification.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(q),
  ]);

  return { items, total, page, limit };
};

const markAsRead = async (id: string, userId: string) => {
  const n = await Notification.findOne({ _id: id, user: userId });
  if (!n) return null;
  if (!n.isRead) {
    n.isRead = true;
    await n.save();
    try {
      const io = (global as any).io;
      if (io) io.to(String(userId)).emit('NOTIFICATION_READ', { id: n._id });
    } catch (err) {
      console.error('Error emitting NOTIFICATION_READ event:', err);
    }
  }
  return n;
};

const markAllAsRead = async (userId: string) => {
  const res = await Notification.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true } }
  );
  try {
    const io = (global as any).io;
    if (io) io.to(String(userId)).emit('NOTIFICATIONS_READ_ALL', {});
  } catch (err) {
    console.error('Error emitting NOTIFICATIONS_READ_ALL event:', err);
  }
  return res;
};

const deleteNotification = async (id: string, userId: string) => {
  const res = await Notification.findOneAndDelete({ _id: id, user: userId });
  return res;
};

export const NotificationService = {
  getNotificationsForUser,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
