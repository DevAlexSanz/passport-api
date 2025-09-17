import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { env } from '@config/config';
import { jsonResponse } from '@shared/utils/json-response';
import { Role } from '@shared/types/Role';

interface JwtPayload {
  id: string;
  role: Role;
  email: string;
  pharmacyId?: string;
}

export const validateAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return jsonResponse(res, {
      message: 'Authentication required',
      statusCode: 401,
      success: false,
    });
  }

  try {
    const decoded = jwt.verify(token, env.TOKEN_SECRET) as JwtPayload;

    if (!decoded?.id || !decoded?.role || !decoded?.email) {
      return jsonResponse(res, {
        message: 'Invalid token payload',
        statusCode: 403,
        success: false,
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      pharmacyId: decoded?.pharmacyId,
    };

    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return jsonResponse(res, {
        message: 'Session expired',
        statusCode: 401,
        success: false,
      });
    }

    if (error instanceof JsonWebTokenError) {
      return jsonResponse(res, {
        message: 'Invalid token',
        statusCode: 403,
        success: false,
      });
    }

    return jsonResponse(res, {
      message: 'Authentication failure',
      statusCode: 500,
      success: false,
    });
  }
};
