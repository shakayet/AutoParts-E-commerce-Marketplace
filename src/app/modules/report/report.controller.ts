/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReportService } from './report.service';
import { StatusCodes } from 'http-status-codes';

const createReport = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const payload = req.body;
  const result = await ReportService.createReportToDB(user.id, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Report submitted successfully',
    data: result,
  });
});

const getReports = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ReportService.getReportsFromDB(query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Reports retrieved successfully',
    data: result,
  });
});

export const ReportController = { createReport, getReports };
