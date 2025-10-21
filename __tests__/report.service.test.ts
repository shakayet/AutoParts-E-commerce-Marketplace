/* eslint-disable no-undef */
import { ReportService } from '../src/app/modules/report/report.service';
import { Report } from '../src/app/modules/report/report.model';
import { Notification } from '../src/app/modules/notification/notification.model';

jest.mock('../src/app/modules/report/report.model');
jest.mock('../src/app/modules/notification/notification.model');

describe('ReportService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createReportToDB creates report and notification', async () => {
    (Report.create as jest.Mock).mockResolvedValue({ _id: 'r1', type: 'product', targetId: 'p1' });
    (Notification.create as jest.Mock).mockResolvedValue({ _id: 'n1' });

    const res = await ReportService.createReportToDB('user1', { type: 'product', targetId: 'p1', reason: 'spam' });

    expect(Report.create).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalled();
    expect(res).toEqual(expect.objectContaining({ _id: 'r1' }));
  });

  it('getReportsFromDB filters by query', async () => {
    const docs = [{ _id: 'r1' }];
    // mock chain: find(...).sort(...).limit(...) -> Promise<docs>
    (Report.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(docs),
      }),
    });

    const res = await ReportService.getReportsFromDB({ type: 'product' });
    expect(Report.find).toHaveBeenCalledWith(expect.objectContaining({ type: 'product' }));
    expect(res).toEqual(docs);
  });
});
