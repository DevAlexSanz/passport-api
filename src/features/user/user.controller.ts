import { Request, RequestHandler, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { UserService } from './user.service';
import { jsonResponse } from '@utils/json-response';

@injectable()
export class UserController {
  constructor(@inject(UserService) private readonly userService: UserService) {}

  getAllUsers: RequestHandler = async (
    _request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const users = await this.userService.findAll();

      jsonResponse(response, {
        message: 'OK',
        statusCode: 200,
        success: true,
        data: users,
      });
    } catch (error) {
      jsonResponse(response, {
        message: 'Internal Server Error',
        statusCode: 500,
        success: false,
      });
    }
  };
}
