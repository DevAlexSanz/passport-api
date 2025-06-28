import { Response } from 'express';
import { JsonResponse } from '@appTypes/JsonResponse';

export const jsonResponse = (
  response: Response,
  payload: JsonResponse
): void => {
  response.status(payload.statusCode).json({
    ...payload,
  });
};
