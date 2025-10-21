/* eslint-disable @typescript-eslint/no-explicit-any */
export type INotification = {
  user: string; // recipient user id
  type: string; // e.g., NEW_REVIEW, PRODUCT_REPORTED
  data?: unknown;
  isRead?: boolean;
};

export type NotificationModel = object;

