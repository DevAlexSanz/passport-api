import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '@features/auth/auth.controller';
import { validateDto } from '@middlewares/validate-dto';
import { CreateUserDTO } from '@features/auth/dto/create-user.dto';
import { validateToken } from '@shared/middlewares/validate-token';

const router = Router();

const authController = container.resolve(AuthController);

router.post(
  '/register',
  validateDto(CreateUserDTO, 'body'),
  authController.registerUser
);
router.post(
  '/register/with-pharmacy',
  authController.registerAdminWithPharmacy
);

router.post('/login', validateDto(CreateUserDTO, 'body'), authController.login);

router.get('/me', validateToken, authController.getMe);

export default router;
