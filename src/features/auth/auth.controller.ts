import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { AuthService } from '@features/auth/auth.service';
import { jsonResponse } from '@utils/json-response';
import { ConflictException } from '@exceptions/conflict-exception';
import { CreateUserDTO } from './dto/create-user.dto';
import { CreateAdminWithPharmacyDTO } from './dto/create-pharmacy.dto';
import logger from '@config/logger';
import { UnauthorizedException } from '@shared/exceptions/unauthorized.exception';
import { NotFoundException } from '@shared/exceptions/not-found.exception';
import { commonOptions } from '@config/cookie';

@injectable()
export class AuthController {
  constructor(@inject(AuthService) private readonly authService: AuthService) {}

  registerAdminWithPharmacy = async (request: Request, response: Response) => {
    const dto: CreateAdminWithPharmacyDTO = request.body;

    try {
      const codeVerification =
        await this.authService.registerAdminWithPharmacy(dto);

      jsonResponse(response, {
        message: `Registered`,
        statusCode: 201,
        success: true,
        data: {
          codeVerification,
        },
      });
    } catch (error) {
      logger.error(error);

      if (error instanceof ConflictException) {
        return jsonResponse(response, {
          message: error.message,
          statusCode: error.statusCode,
          success: error.success,
        });
      }

      jsonResponse(response, {
        message: 'Internal Server Error',
        statusCode: 500,
        success: false,
      });
    }
  };

  registerUser = async (request: Request, response: Response) => {
    const { email, password }: CreateUserDTO = request.body;

    try {
      const codeVerification = await this.authService.registerUser({
        email,
        password,
      });

      jsonResponse(response, {
        message: 'Registered',
        statusCode: 201,
        success: true,
        data: {
          codeVerification,
        },
      });
    } catch (error) {
      logger.error(error);

      if (error instanceof ConflictException) {
        return jsonResponse(response, {
          message: error.message,
          statusCode: error.statusCode,
          success: error.success,
        });
      }

      jsonResponse(response, {
        message: 'Internal Server Error',
        statusCode: 500,
        success: false,
      });
    }
  };

  login = async (request: Request, response: Response) => {
    const { email, password } = request.body;

    try {
      const { accessToken, refreshToken } =
        await this.authService.authenticateUser({ email, password });

      response.cookie('accessToken', accessToken, {
        ...commonOptions,
        maxAge: 1000 * 60 * 15,
      });

      response.cookie('refreshToken', refreshToken, {
        ...commonOptions,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

      jsonResponse(response, {
        message: 'Logged in successfully',
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      logger.error(error);

      if (error instanceof NotFoundException) {
        return jsonResponse(response, {
          message: error.message,
          statusCode: error.statusCode,
          success: error.success,
        });
      }

      if (error instanceof UnauthorizedException) {
        return jsonResponse(response, {
          message: error.message,
          statusCode: error.statusCode,
          success: error.success,
        });
      }

      jsonResponse(response, {
        message: 'Internal Server Error',
        statusCode: 500,
        success: false,
      });
    }
  };

  getMe = async (request: Request, response: Response) => {
    const userId = request.user?.id;

    try {
      const user = await this.authService.getMe(userId as string);

      jsonResponse(response, {
        message: 'User retrieved successfully',
        statusCode: 200,
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error(error);

      if (error instanceof NotFoundException) {
        return jsonResponse(response, {
          message: error.message,
          statusCode: error.statusCode,
          success: error.success,
        });
      }

      jsonResponse(response, {
        message: 'Internal Server Error',
        statusCode: 500,
        success: false,
      });
    }
  };
}
