import { Router } from 'express';
import { container } from 'tsyringe';
import { upload } from '@middlewares/multer';
import { validateDto } from '@middlewares/validate-dto';
import { validateAccessToken } from '@middlewares/validate-access-token';
import { CreateProductDTO } from './dto/create-product.dto';
import { ProductController } from './product.controller';
import { requireRole } from '@middlewares/require-role';

const router = Router();

const productController = container.resolve(ProductController);

router.get('/', productController.getAllProducts);

router.get(
  '/:pharmacyId',
  validateAccessToken,
  productController.getProductsByPharmacy
);

router.post(
  '/',
  upload.single('productImage'),
  validateAccessToken,
  requireRole(['ADMIN', 'EMPLOYEE']),
  validateDto(CreateProductDTO, 'body'),
  productController.createProduct
);

export default router;
