import { Router } from 'express';
import { container } from 'tsyringe';
import { validateDto } from '@middlewares/validate-dto';
import { validateAccessToken } from '@shared/middlewares/validate-access-token';
import { upload } from '@middlewares/multer';
import { CreateProductDTO } from './dto/create-product.dto';
import { ProductController } from './product.controller';

const router = Router();

const productController = container.resolve(ProductController);

router.get('/', productController.getAllProducts);

router.post(
  '/',
  upload.single('productImage'),
  validateAccessToken,
  validateDto(CreateProductDTO, 'body'),
  productController.createProduct
);

export default router;
