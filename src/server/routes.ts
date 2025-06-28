import { Router } from 'express';
import featuresRoutes from '@features/features.routes';

const router = Router();

router.use(featuresRoutes);

export default router;
