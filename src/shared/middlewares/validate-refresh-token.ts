import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { env } from '@config/config';
import { jsonResponse } from '@shared/utils/json-response';

export const validateRefreshToken = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const token = request.cookies.refreshToken;

  if (!token) {
    return jsonResponse(response, {
      message: 'Token required',
      statusCode: 401,
      success: false,
    });
  }

  try {
    jwt.verify(token, env.TOKEN_SECRET, (err: any, decoded: any) => {
      if (err !== null && err.name === 'TokenExpiredError') {
        return jsonResponse(response, {
          message: 'Token has expired',
          statusCode: 401,
          success: false,
        });
      }

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
  } catch (error) {
    console.error('Token verification error:', error);
    return jsonResponse(response, {
      message: 'Invalid token',
      statusCode: 403,
      success: false,
    });
  }
};
