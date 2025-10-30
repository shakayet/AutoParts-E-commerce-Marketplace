import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { ProductController } from './product.controller';
import { ProductValidation } from './product.validation';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
  .route('/')
  .get(
    validateRequest(ProductValidation.productQueryZodSchema),
    ProductController.getProducts
  )
  .post(
    auth(USER_ROLES.USER),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      req.body = ProductValidation.createProductZodSchema.parse(
        JSON.parse(req?.body?.data)
      );
      return ProductController.createProduct(req, res, next);
    }
  );

router.route('/advanced').get(ProductController.getAdvancedProducts);

router
  .route('/:id')
  .get(ProductController.getProductById)
  .patch(
    auth(USER_ROLES.USER),
    fileUploadHandler(),
    // validateRequest(ProductValidation.updateProductZodSchema),
    (req: Request, res: Response, next: NextFunction) => {
      req.body = ProductValidation.createProductZodSchema.parse(
        JSON.parse(req?.body?.data)
      );
      return ProductController.updateProduct(req, res, next);
    }
  )
  .delete(auth(USER_ROLES.USER), ProductController.deleteProduct);

router.route('/:id/related').get(ProductController.getRelatedProducts);

export const ProductRoutes = router;
