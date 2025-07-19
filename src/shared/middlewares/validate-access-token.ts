import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { env } from '@config/config';
import { jsonResponse } from '@shared/utils/json-response';

export const validateAccessToken = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const token = request.cookies.accessToken;

  if (!token) {
    return jsonResponse(response, {
      message: 'Authentication required',
      statusCode: 401,
      success: false,
    });
  }

  if (
    typeof token !== 'string' ||
    !/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.?[A-Za-z0-9-_.+/=]*$/.test(token)
  ) {
    return jsonResponse(response, {
      message: 'Malformed token',
      statusCode: 400,
      success: false,
    });
  }

  try {
    const decoded = jwt.verify(token, env.TOKEN_SECRET) as { id?: string };

    if (!decoded?.id) {
      return jsonResponse(response, {
        message: 'Invalid token payload',
        statusCode: 403,
        success: false,
      });
    }

    request.user = { id: decoded.id };
    next();
  } catch (error) {
    const errorMessages: Record<
      string,
      { message: string; statusCode: number }
    > = {
      [TokenExpiredError.name]: { message: 'Session expired', statusCode: 401 },
      [JsonWebTokenError.name]: { message: 'Invalid token', statusCode: 403 },
    };

    const jwtError =
      error instanceof Error ? error : new Error('Unknown error');
    const responseError = errorMessages[jwtError.name] || {
      message: 'Authentication failure',
      statusCode: 500,
    };

    return jsonResponse(response, {
      ...responseError,
      success: false,
    });
  }
};
