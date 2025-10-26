/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReportService } from './report.service';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';
import { JwtPayload } from 'jsonwebtoken';

const createReport = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload; // Use proper type instead of 'any'
  const payload = req.body;

  // Validate required fields
  if (!payload.type || !payload.targetId || !payload.reason) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Missing required fields: type, targetId, or reason',
      data: null,
    });
  }

  const image = getSingleFilePath(req.files as any, 'image');
  
  const data = {
    ...payload,
    image,
  };

  const result = await ReportService.createReportToDB(user.id, data);

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
