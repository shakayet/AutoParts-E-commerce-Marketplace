import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PrivacyPolicyService } from './privacyPolicy.service';
import { StatusCodes } from 'http-status-codes';

const createPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const result = await PrivacyPolicyService.createPrivacyPolicyToDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Privacy policy created',
    data: result,
  });
});

const updatePrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PrivacyPolicyService.updatePrivacyPolicyToDB(
    id,
    req.body,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Privacy policy updated',
    data: result,
  });
});

const deletePrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await PrivacyPolicyService.deletePrivacyPolicyFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Privacy policy deleted',
  });
});

const getPrivacyPolicies = catchAsync(async (req: Request, res: Response) => {
  const result = await PrivacyPolicyService.getPrivacyPoliciesFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Privacy policies retrieved',
    data: result,
  });
});

export const PrivacyPolicyController = {
  createPrivacyPolicy,
  updatePrivacyPolicy,
  deletePrivacyPolicy,
  getPrivacyPolicies,
};
