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
import { Role } from '@appTypes/Role';

@injectable()
export class AuthController {
  constructor(@inject(AuthService) private readonly authService: AuthService) {}

  registerAdminWithPharmacy = async (request: Request, response: Response) => {
    const dto: CreateAdminWithPharmacyDTO = request.body;

    const files = request.files as {
      profilePhoto?: Express.Multer.File[];
      coverPhoto?: Express.Multer.File[];
    };

    if (!files.profilePhoto || !files.coverPhoto) {
      return jsonResponse(response, {
        message: 'Both profile and cover photos are required',
        statusCode: 400,
        success: false,
      });
    }

    try {
      const profilePhoto = files.profilePhoto?.[0];
      const coverPhoto = files.coverPhoto?.[0];

      await this.authService.registerAdminWithPharmacy(
        dto,
        profilePhoto,
        coverPhoto
      );

      jsonResponse(response, {
        message: `Registered`,
        statusCode: 201,
        success: true,
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
      await this.authService.registerUser({
        email,
        password,
      });

      jsonResponse(response, {
        message: 'Registered',
        statusCode: 201,
        success: true,
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
    const userRole = request.user?.role;

    try {
      const user = await this.authService.getMe(
        userId as string,
        userRole as Role
      );

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

  verifyAccount = async (request: Request, response: Response) => {
    const userId = request.user?.id;
    const { codeVerification } = request.body;

    try {
      await this.authService.verifyAccount({
        id: userId as string,
        code: Number(codeVerification),
      });

      jsonResponse(response, {
        message: 'User verified successfully',
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

  refreshAccessToken = async (request: Request, response: Response) => {
    const userId = request.user?.id;

    try {
      const { accessToken } = await this.authService.refreshAccessToken(
        userId as string
      );

      response.cookie('accessToken', accessToken, {
        ...commonOptions,
        maxAge: 1000 * 60 * 15,
      });

      jsonResponse(response, {
        message: 'Access token refreshed successfully',
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

      jsonResponse(response, {
        message: 'Internal Server Error',
        statusCode: 500,
        success: false,
      });
    }
  };

  logout = async (_request: Request, response: Response) => {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');

    response.status(204).send();
  };
}
