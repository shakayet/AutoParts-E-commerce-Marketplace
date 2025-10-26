import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ReportController } from './report.controller';
import { ReportValidation } from './report.validation';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.USER),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      req.body = ReportValidation.createReportZodSchema.parse(
        JSON.parse(req?.body?.data)
      );
      return ReportController.createReport(req, res, next);
    }
  );

router
  .route('/')
  .get(
    auth(USER_ROLES.ADMIN),
    validateRequest(ReportValidation.getReportsZodSchema),
    ReportController.getReports
  );

export const ReportRoutes = router;
