import { Router } from 'express';
import { container } from 'tsyringe';
import { upload } from '@middlewares/multer';
import { validateDto } from '@middlewares/validate-dto';
import passportRoutes from './strategies/passport.routes';
import { AuthController } from '@features/auth/auth.controller';
import { CreateUserDTO } from '@features/auth/dto/create-user.dto';
import { validateAccessToken } from '@shared/middlewares/validate-access-token';
import { CreateAdminWithPharmacyDTO } from './dto/create-admin-with-pharmacy.dto';

const router = Router();

const authController = container.resolve(AuthController);

router.use(passportRoutes);

router.post(
  '/register',
  validateDto(CreateUserDTO, 'body'),
  authController.registerUser
);

router.post(
  '/register/pharmacy',
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  validateDto(CreateAdminWithPharmacyDTO, 'body'),
  authController.registerPharmacy
);

router.post('/login', validateDto(CreateUserDTO, 'body'), authController.login);

router.get('/me', validateAccessToken, authController.getMe);

router.post(
  '/verify-account',
  validateAccessToken,
  authController.verifyAccount
);

router.post('/refresh-token', authController.refreshAccessToken);

router.post(
  '/resend-code',
  validateAccessToken,
  authController.resendCodeVerification
);

router.post('/logout', authController.logout);

router.get('/done', (_request, response) => {
  response.status(200).json({
    message: 'Success',
    success: true,
  });
});

export default router;
