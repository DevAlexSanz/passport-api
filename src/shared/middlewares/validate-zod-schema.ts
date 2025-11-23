import { AnyZodObject, ZodError } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { jsonResponse } from '@utils/json-response';

export const validateZodSchema = (schema: {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
}) => {
  return (request: Request, response: Response, next: NextFunction) => {
    try {
      if (schema.body) request.body = schema.body.parse(request.body);
      if (schema.params) request.params = schema.params.parse(request.params);
      if (schema.query) request.query = schema.query.parse(request.query);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((issue) => ({
          path: issue.path.join(','),
          message: issue.message,
        }));

        jsonResponse(response, {
          message: 'Invalid Data',
          statusCode: 400,
          success: false,
          errors: issues,
        });
      }

      jsonResponse(response, {
        message: 'Internal Server Error',
        statusCode: 500,
        success: false,
      });
    }
  };
};
