import logger from '@config/logger';
import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { jsonResponse } from '@utils/json-response';
import { NotFoundException } from '@exceptions/not-found.exception';
import { ProductCategoryService } from './product-category.service';
import { UnauthorizedException } from '@shared/exceptions/unauthorized.exception';
import { isAdminPayload } from '@shared/utils/is-admin-payload';
import { ForbiddenException } from '@shared/exceptions/forbidden.exception';

@injectable()
export class ProductCategoryController {
  constructor(
    @inject(ProductCategoryService)
    private readonly categoryService: ProductCategoryService
  ) {}

  findAll = async (request: Request, response: Response) => {
    const { id } = request.params;

    try {
      const records = await this.categoryService.findAll(id);

      jsonResponse(response, {
        message: 'Success!',
        statusCode: 200,
        success: true,
        records,
      });
    } catch (err) {
      logger.error(err);

      jsonResponse(response, {
        message: 'Internal Server Error',
        statusCode: 500,
        success: false,
      });
    }
  };

  findAllByPharmacy = async (request: Request, response: Response) => {
    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    if (!isAdminPayload(user)) {
      throw new ForbiddenException('User is not an admin');
    }

    try {
      const records = await this.categoryService.findAllByPharmacyId(
        user.pharmacyId
      );

      jsonResponse(response, {
        message: 'Ok',
        statusCode: 200,
        success: true,
        records,
      });
    } catch (error) {
      logger.error(error);

      if (error instanceof NotFoundException) {
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

  create = async (request: Request, response: Response) => {
    const dto = request.body;
    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    if (!isAdminPayload(user)) {
      throw new ForbiddenException('User is not an admin');
    }

    try {
      await this.categoryService.create(user.pharmacyId, dto);

      jsonResponse(response, {
        message: 'Creation Successful!',
        statusCode: 201,
        success: true,
      });
    } catch (err) {
      logger.error(err);

      jsonResponse(response, {
        message: 'Internal Server Error',
        statusCode: 500,
        success: false,
      });
    }
  };
}
