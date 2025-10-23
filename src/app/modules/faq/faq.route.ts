/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FAQController } from './faq.controller';
import { FAQValidation } from './faq.validation';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    FAQController.getFAQs
  )
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      req.body = FAQValidation.createFAQZodSchema.parse(
        JSON.parse(req?.body?.data)
      );
      return FAQController.createFAQ(req, res, next);
    }
  );

// validateRequest(FAQValidation.createFAQZodSchema), FAQController.createFAQ);
router
  .route('/:id')
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    fileUploadHandler(),

    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = FAQValidation.updateFAQZodSchema.parse(
          JSON.parse(req?.body?.data)
        );
      }

      return FAQController.updateFAQ(req, res, next);
    }
  )
  .delete(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), FAQController.deleteFAQ);

export const FAQRoutes = router;
