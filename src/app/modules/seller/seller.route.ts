import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { SellerController } from './seller.controller';
import { SellerValidation } from './seller.validation';

const router = express.Router();

router
	.route('/:id/location')
	.get(validateRequest(SellerValidation.getSellerLocationZodSchema), SellerController.getSellerLocationLink);

export const SellerRoutes = router;
