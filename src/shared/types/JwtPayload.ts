import { Role } from '@shared/types/Role';

export interface BasePayload {
  id: string;
  email: string;
}

export interface AdminPayload extends BasePayload {
  role: Role;
  pharmacyId: string;
};

export interface UserPayload extends BasePayload {
  role: Role;
};

export type JwtPayload = AdminPayload | UserPayload;

