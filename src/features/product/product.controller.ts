import { inject, injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { ProductService } from './product.service';
import { jsonResponse } from '@shared/utils/json-response';
import logger from '@config/logger';
import { CreateProductDTO } from './dto/create-product.dto';

@injectable()
export class ProductController {
  constructor(
    @inject(ProductService) private readonly productService: ProductService
  ) {}

  createProduct = async (request: Request, response: Response) => {
    const pharmacyId = request.user?.pharmacyId;
    const dto: CreateProductDTO = request.body;

    const image = request.file;

    if (!image) {
      return jsonResponse(response, {
        message: 'Product image is required',
        statusCode: 400,
        success: false,
      });
    }

    try {
      await this.productService.createProduct(pharmacyId as string, dto, image);

      jsonResponse(response, {
        message: `Registered`,
        statusCode: 201,
        success: true,
      });
    } catch (error) {
      logger.error(error);

      jsonResponse(response, {
        message: 'Internal Server Error',
        statusCode: 500,
        success: false,
      });
    }
  };
}
