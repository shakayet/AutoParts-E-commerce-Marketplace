import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PrivacyPolicyController } from './privacyPolicy.controller';
import { PrivacyPolicyValidation } from './privacyPolicy.validation';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
  .route('/')
  .get(PrivacyPolicyController.getPrivacyPolicies)
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(PrivacyPolicyValidation.createPrivacyPolicyZodSchema),
    PrivacyPolicyController.createPrivacyPolicy,
  );
router
  .route('/:id')
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(PrivacyPolicyValidation.updatePrivacyPolicyZodSchema),
    PrivacyPolicyController.updatePrivacyPolicy,
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    PrivacyPolicyController.deletePrivacyPolicy,
  );

export const PrivacyPolicyRoutes = router;
