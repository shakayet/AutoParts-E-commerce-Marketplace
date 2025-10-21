/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReportController } from '../src/app/modules/report/report.controller';
import { ReportService } from '../src/app/modules/report/report.service';

jest.mock('../src/app/modules/report/report.service');

describe('ReportController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createReport calls service and returns created report', async () => {
    const mockReq: any = { user: { id: 'u1' }, body: { type: 'product', targetId: 'p1', reason: 'spam' } };
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    (ReportService.createReportToDB as jest.Mock).mockResolvedValue({ _id: 'r1' });

    await ReportController.createReport(mockReq, mockRes, jest.fn());

    expect(ReportService.createReportToDB).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalled();
  });
});
