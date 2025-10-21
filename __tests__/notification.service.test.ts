/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { NotificationService } from '../src/app/modules/notification/notification.service';
import { Notification } from '../src/app/modules/notification/notification.model';

jest.mock('../src/app/modules/notification/notification.model');

describe('NotificationService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getNotificationsForUser returns paginated items and total', async () => {
    const items = [{ _id: 'n1' }];
    (Notification.find as jest.Mock).mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue(items) }) }) });
    (Notification.countDocuments as jest.Mock).mockResolvedValue(1);

    const res = await NotificationService.getNotificationsForUser('u1', { page: 1, limit: 10 });
    expect(Notification.find).toHaveBeenCalled();
    expect(res.items).toEqual(items);
    expect(res.total).toBe(1);
  });

  it('getUnreadCount returns count', async () => {
    (Notification.countDocuments as jest.Mock).mockResolvedValue(5);
    const c = await NotificationService.getUnreadCount('u1');
    expect(c).toBe(5);
  });

  it('markAsRead updates and returns notification', async () => {
    const doc: any = { _id: 'n1', isRead: false, save: jest.fn() };
    (Notification.findOne as jest.Mock).mockResolvedValue(doc);
    const res = await NotificationService.markAsRead('n1', 'u1');
    expect(doc.save).toHaveBeenCalled();
    expect(res).toEqual(doc);
  });

  it('markMultipleAsRead calls updateMany', async () => {
    (Notification.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 2 });
    const res = await NotificationService.markMultipleAsRead(['n1', 'n2'], 'u1');
    expect(Notification.updateMany).toHaveBeenCalled();
    expect(res).toEqual(expect.objectContaining({ modifiedCount: expect.any(Number) }));
  });

  it('deleteNotification deletes and returns', async () => {
    (Notification.findOneAndDelete as jest.Mock).mockResolvedValue({ _id: 'n1' });
    const res = await NotificationService.deleteNotification('n1', 'u1');
    expect(Notification.findOneAndDelete).toHaveBeenCalledWith({ _id: 'n1', user: 'u1' });
    expect(res).toEqual(expect.objectContaining({ _id: 'n1' }));
  });
});
