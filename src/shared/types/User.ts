import { Role } from '@appTypes/Role';

export interface User {
  id: string;
  email: string;
  password: string;
  codeVerification: string | null;
  isVerified: boolean;
  role: Role;
  createdAt: string | null;
  updatedAt: string | null;
}

export type CreateUser = Pick<
  User,
  'email' | 'password' | 'role'
>;
