import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { env } from '@config/config';
import { jsonResponse } from '@shared/utils/json-response';

export const validateToken = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const token = request.cookies.accessToken;

  if (!token) {
    return jsonResponse(response, {
      message: 'Token required',
      statusCode: 401,
      success: false,
    });
  }

  jwt.verify(token, env.TOKEN_SECRET, (err: any, decoded: any) => {
    if (err) {
      return jsonResponse(response, {
        message: 'Invalid token',
        statusCode: 403,
        success: false,
      });
    }

    request.user = { id: decoded.id };

    next();
  });
};
