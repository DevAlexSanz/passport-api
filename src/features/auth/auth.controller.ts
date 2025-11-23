import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { AuthService } from '@features/auth/auth.service';
import { jsonResponse } from '@utils/json-response';
import { ConflictException } from '@exceptions/conflict.exception';
import { CreateUserDTO } from './dto/create-user.dto';
import { CreateAdminWithPharmacyDTO } from './dto/create-admin-with-pharmacy.dto';
import logger from '@config/logger';
import { UnauthorizedException } from '@shared/exceptions/unauthorized.exception';
import { NotFoundException } from '@shared/exceptions/not-found.exception';
import { commonOptions } from '@config/cookie';
import { TooManyRequestsException } from '@exceptions/too-many-requests.exception';
import { BadRequestException } from '@exceptions/bad-request.exception';
import { ForbiddenException } from '@exceptions/forbidden.exception';
import { generateToken } from '@shared/utils/jwt';
import { env } from '@config/config';

@injectable()
export class AuthController {
  constructor(@inject(AuthService) private readonly authService: AuthService) {}

  registerPharmacy = async (request: Request, response: Response) => {
    const dto: CreateAdminWithPharmacyDTO = request.body;

    if (
      !request.files ||
      typeof request.files !== 'object' ||
      Array.isArray(request.files)
    ) {
      throw new BadRequestException('Invalid file upload');
    }

    const files = request.files;

    if (!files.profilePhoto || !files.coverPhoto) {
      jsonResponse(response, {
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

      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        jsonResponse(response, {
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
        jsonResponse(response, {
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
      });

      response.cookie('refreshToken', refreshToken, {
        ...commonOptions,
      });

      jsonResponse(response, {
        message: 'Logged in successfully',
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      logger.error(error);

      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        jsonResponse(response, {
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
    const { user: userRequest } = request;

    if (!userRequest) {
      throw new UnauthorizedException('User not found in request');
    }
    try {
      const { user, pharmacy } = await this.authService.getMe(userRequest.id);

      jsonResponse(response, {
        message: 'User retrieved successfully',
        statusCode: 200,
        success: true,
        record: {
          user,
          pharmacy,
        },
      });
    } catch (error) {
      logger.error(error);

      if (error instanceof NotFoundException) {
        jsonResponse(response, {
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
    const { codeVerification } = request.body;
    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    try {
      await this.authService.verifyAccount({
        id: user.id,
        code: Number(codeVerification),
      });

      jsonResponse(response, {
        message: 'User verified successfully',
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      logger.error(error);

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        jsonResponse(response, {
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
    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    try {
      const { accessToken } = await this.authService.refreshAccessToken(
        user.id
      );

      response.cookie('accessToken', accessToken, {
        ...commonOptions,
      });

      jsonResponse(response, {
        message: 'Access token refreshed successfully',
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      logger.error(error);

      if (error instanceof NotFoundException) {
        jsonResponse(response, {
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

  resendCodeVerification = async (request: Request, response: Response) => {
    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    try {
      await this.authService.resendCodeVerification(user.id);

      jsonResponse(response, {
        message: 'Access token refreshed successfully',
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      logger.error(error);

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof TooManyRequestsException
      ) {
        jsonResponse(response, {
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

  oauthCallback = async (request: Request, response: Response) => {
    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    try {
      const { accessToken, refreshToken } = generateToken({
        id: user.id,
        role: user.role,
        email: user.email,
      });

      response.cookie('accessToken', accessToken, {
        ...commonOptions,
      });

      response.cookie('refreshToken', refreshToken, {
        ...commonOptions,
      });

      response.redirect(`${env.DAVIDA_CLIENT_URL}/admin/dashboard`);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        jsonResponse(response, {
          message: error.name,
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
