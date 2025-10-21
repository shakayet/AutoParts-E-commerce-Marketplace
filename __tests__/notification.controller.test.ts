/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { NotificationController } from '../src/app/modules/notification/notification.controller';
import { NotificationService } from '../src/app/modules/notification/notification.service';

jest.mock('../src/app/modules/notification/notification.service');

describe('NotificationController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getNotifications calls service and returns data', async () => {
    const mockReq: any = { user: { id: 'u1' }, query: {} };
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    (NotificationService.getNotificationsForUser as jest.Mock).mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });

    await NotificationController.getNotifications(mockReq, mockRes, jest.fn());

    expect(NotificationService.getNotificationsForUser).toHaveBeenCalledWith('u1', {});
    expect(mockRes.status).toHaveBeenCalled();
  });

  it('getUnreadCount returns count', async () => {
    const mockReq: any = { user: { id: 'u1' } };
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    (NotificationService.getUnreadCount as jest.Mock).mockResolvedValue(3);

    await NotificationController.getUnreadCount(mockReq, mockRes, jest.fn());

    expect(NotificationService.getUnreadCount).toHaveBeenCalledWith('u1');
    expect(mockRes.status).toHaveBeenCalled();
  });

  it('markMultipleRead calls service with ids', async () => {
    const mockReq: any = { user: { id: 'u1' }, body: { ids: ['n1', 'n2'] } };
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    (NotificationService.markMultipleAsRead as jest.Mock).mockResolvedValue({ modifiedCount: 2 });

    await NotificationController.markMultipleRead(mockReq, mockRes, jest.fn());

    expect(NotificationService.markMultipleAsRead).toHaveBeenCalledWith(['n1', 'n2'], 'u1');
    expect(mockRes.status).toHaveBeenCalled();
  });

  it('deleteNotification calls service with id', async () => {
    const mockReq: any = { user: { id: 'u1' }, params: { id: 'n1' } };
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    (NotificationService.deleteNotification as jest.Mock).mockResolvedValue({ _id: 'n1' });

    await NotificationController.deleteNotification(mockReq, mockRes, jest.fn());

    expect(NotificationService.deleteNotification).toHaveBeenCalledWith('n1', 'u1');
    expect(mockRes.status).toHaveBeenCalled();
  });

  it('markRead calls service with id', async () => {
    const mockReq: any = { user: { id: 'u1' }, params: { id: 'n1' } };
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    (NotificationService.markAsRead as jest.Mock).mockResolvedValue({ _id: 'n1' });

    await NotificationController.markRead(mockReq, mockRes, jest.fn());

    expect(NotificationService.markAsRead).toHaveBeenCalledWith('n1', 'u1');
    expect(mockRes.status).toHaveBeenCalled();
  });

  it('markAllRead calls service for user', async () => {
    const mockReq: any = { user: { id: 'u1' } };
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    (NotificationService.markAllAsRead as jest.Mock).mockResolvedValue({ modifiedCount: 5 });

    await NotificationController.markAllRead(mockReq, mockRes, jest.fn());

    expect(NotificationService.markAllAsRead).toHaveBeenCalledWith('u1');
    expect(mockRes.status).toHaveBeenCalled();
  });
});
