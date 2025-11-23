import { Role } from '@shared/constants/Role';
import { JwtPayload } from '../JwtPayload';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}
