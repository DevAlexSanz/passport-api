import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '@features/auth/auth.controller';
import { validateDto } from '@middlewares/validate-dto';
import { CreateUserDTO } from '@features/auth/dto/create-user.dto';
import { validateAccessToken } from '@shared/middlewares/validate-access-token';
import { validateRefreshToken } from '@shared/middlewares/validate-refresh-token';

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

router.get('/me', validateAccessToken, authController.getMe);

router.post(
  '/verify-account',
  validateAccessToken,
  authController.verifyAccount
);

router.post(
  '/refresh-token',
  validateRefreshToken,
  authController.refreshAccessToken
);

export default router;
