import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from '@features/employee/dto/create-employee.dto';
import { ConflictException } from '@exceptions/conflict.exception';
import { jsonResponse } from '@utils/json-response';
import logger from '@config/logger';
import { ForbiddenException } from '@exceptions/forbidden.exception';
import { isAdminPayload } from '@utils/is-admin-payload';
import { UnauthorizedException } from '@shared/exceptions/unauthorized.exception';

@injectable()
export class EmployeeController {
  constructor(
    @inject(EmployeeService) private readonly employeeService: EmployeeService
  ) {}

  create = async (request: Request, response: Response) => {
    const body = request.body as CreateEmployeeDto;
    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    if (!isAdminPayload(user)) {
      throw new ForbiddenException('User is not an admin');
    }

    try {
      await this.employeeService.createEmployee(user.pharmacyId, body);

      jsonResponse(response, {
        message: 'Employee created successfully',
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      logger.error(error);

      if (
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) {
        jsonResponse(response, {
          ...error,
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
