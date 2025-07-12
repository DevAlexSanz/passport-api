import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { AuthService } from '@features/auth/auth.service';
import { jsonResponse } from '@utils/json-response';
import { ConflictException } from '@exceptions/conflict-exception';
import { CreateUserDTO } from './dto/create-user.dto';
import { CreateAdminWithPharmacyDTO } from './dto/create-pharmacy.dto';
import logger from '@config/logger';

@injectable()
export class AuthController {
  constructor(@inject(AuthService) private readonly authService: AuthService) {}

  async registerAdminWithPharmacy(request: Request, response: Response) {
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
  }

  async registerUser(request: Request, response: Response) {
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
  }
}
