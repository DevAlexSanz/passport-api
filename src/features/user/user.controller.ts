import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { UserService } from './user.service';
import { jsonResponse } from '@utils/json-response';
import logger from '@config/logger';

@injectable()
export class UserController {
  constructor(@inject(UserService) private readonly userService: UserService) {}

  async getAllUsers(_request: Request, response: Response) {
    try {
      const users = await this.userService.findAll();

      jsonResponse(response, {
        message: 'OK',
        statusCode: 200,
        success: true,
        data: users,
      });
    } catch (error) {
      logger.error(error);

      jsonResponse(response, {
        message: 'Internal Server Error',
        statusCode: 500,
        success: false,
      });
    }
  }
}
