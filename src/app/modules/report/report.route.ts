import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ReportController } from './report.controller';
import { ReportValidation } from './report.validation';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route('/').post(auth(USER_ROLES.USER), validateRequest(ReportValidation.createReportZodSchema), ReportController.createReport);

router.route('/').get(auth(USER_ROLES.ADMIN), validateRequest(ReportValidation.getReportsZodSchema), ReportController.getReports);

export const ReportRoutes = router;
