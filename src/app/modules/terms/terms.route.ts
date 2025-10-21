import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TermsController } from './terms.controller';
import { TermsValidation } from './terms.validation';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route('/').get(TermsController.getTerms).post(auth(USER_ROLES.ADMIN), validateRequest(TermsValidation.createTermsZodSchema), TermsController.createTerms);
router.route('/:id').patch(auth(USER_ROLES.ADMIN), validateRequest(TermsValidation.updateTermsZodSchema), TermsController.updateTerms).delete(auth(USER_ROLES.ADMIN), TermsController.deleteTerms);

export const TermsRoutes = router;
