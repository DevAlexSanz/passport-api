import { AdminPayload, JwtPayload } from '@appTypes/JwtPayload';
import { Role } from '@shared/constants/Role';

export const isAdminPayload = (user: JwtPayload): user is AdminPayload => {
  return user.role === Role.ADMIN || user.role === Role.EMPLOYEE;
};
