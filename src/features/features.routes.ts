import { Router } from 'express';
import authRoutes from './auth/auth.routes';
import productRoutes from './product/product.routes';
import employeeRoutes from '@features/employee/employee.routes';
import categoryRoutes from './product-category/product-category.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/employees', employeeRoutes);
router.use('/product-categories', categoryRoutes);

export default router;
