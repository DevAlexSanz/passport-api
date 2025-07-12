import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { jsonResponse } from '@utils/json-response';
import { ValidationSource } from '@appTypes/ValidationSource';

export const validateDto = (dto: any, source: ValidationSource = 'body') => {
  return async (request: Request, response: Response, next: NextFunction) => {
    const data = request[source];

    const instance = plainToInstance(dto, data);

    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,

    });

    if (errors.length > 0) {
      const formattedErrors = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      }));

      return jsonResponse(response, {
        message: 'Validation Failed',
        statusCode: 400,
        success: false,
        errors: formattedErrors,
      });
    }

    return next();
  };
};
