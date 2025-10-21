import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FAQController } from './faq.controller';
import { FAQValidation } from './faq.validation';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route('/').get(FAQController.getFAQs).post(auth(USER_ROLES.ADMIN), validateRequest(FAQValidation.createFAQZodSchema), FAQController.createFAQ);
router.route('/:id').patch(auth(USER_ROLES.ADMIN), validateRequest(FAQValidation.updateFAQZodSchema), FAQController.updateFAQ).delete(auth(USER_ROLES.ADMIN), FAQController.deleteFAQ);

export const FAQRoutes = router;
