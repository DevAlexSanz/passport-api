import { Request, Response, Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '@features/auth/auth.controller';
import { validateDto } from '@middlewares/validate-dto';
import { CreateUserDTO } from '@features/auth/dto/create-user.dto';
import { validateAccessToken } from '@shared/middlewares/validate-access-token';
import { validateRefreshToken } from '@shared/middlewares/validate-refresh-token';
import { CreateAdminWithPharmacyDTO } from './dto/create-pharmacy.dto';
import { upload } from '@middlewares/multer';
import passport from 'passport';
import { commonOptions } from '@config/cookie';
import { jsonResponse } from '@utils/json-response';
import { generateToken } from '@utils/jwt';

const router = Router();

const authController = container.resolve(AuthController);

router.post(
  '/register',
  validateDto(CreateUserDTO, 'body'),
  authController.registerUser
);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (request: Request, response: Response) => {
    try {
      const user = request.user as any;

      if (!user || !user.id) {
        response.status(401).json({ error: 'User not found or invalid' });
        jsonResponse(response, {
          message: 'User not found or invalid',
          statusCode: 401,
          success: false,
        });
      }

      const { accessToken, refreshToken } = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      response.cookie('accessToken', accessToken, {
        ...commonOptions,
      });

      response.cookie('refreshToken', refreshToken, {
        ...commonOptions,
      });

      response.redirect('http://localhost:5173/dashboard');
    } catch (err: any) {
      jsonResponse(response, {
        message: 'Error en login con Google',
        statusCode: 401,
        success: false,
      });
    }
  }
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

router.post(
  '/refresh-token',
  validateRefreshToken,
  authController.refreshAccessToken
);

router.post(
  '/resend-code',
  validateAccessToken,
  authController.resendCodeVerification
);

router.post('/logout', authController.logout);

export default router;
