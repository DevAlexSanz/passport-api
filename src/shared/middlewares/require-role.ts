import { Role } from '@shared/types/Role';
import { Request, Response, NextFunction } from 'express';
import { jsonResponse } from '@utils/json-response';
import { AdminPayload, UserPayload } from '@appTypes/JwtPayload';

export const requireRole = (allowedRoles: Role[]) => {
  return (
    request: Request,
    response: Response,
    next: NextFunction
  ): asserts request is Request & {
    user: AdminPayload | UserPayload;
  } => {
    if (!request.user) {
      return jsonResponse(response, {
        message: 'Unauthorized',
        statusCode: 401,
        success: false,
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return jsonResponse(response, {
        message: 'Forbidden: insufficient role',
        statusCode: 403,
        success: false,
      });
    }

    return next();
  };
};
