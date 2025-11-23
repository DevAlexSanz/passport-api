import { Router } from 'express';
import { container } from 'tsyringe';
import { validateDto } from '@middlewares/validate-dto';
import { validateAccessToken } from '@middlewares/validate-access-token';
import { ProductCategoryController } from './product-category.controller';
import { CreateProductCategoryDTO } from './dto';
import { requireRole } from '@middlewares/require-role';
import { Role } from '@shared/constants/Role';

const router = Router();

const categoryController = container.resolve(ProductCategoryController);

router.get('/', validateAccessToken, categoryController.findAll);

router.get(
  '/:pharmacyId',
  validateAccessToken,
  categoryController.findAllByPharmacy
);

router.post(
  '/',
  validateAccessToken,
  requireRole([Role.ADMIN, Role.EMPLOYEE]),
  validateDto(CreateProductCategoryDTO, 'body'),
  categoryController.create
);

export default router;
