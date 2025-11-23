import { RoleEnum } from '@database/generated/prisma';

export interface User {
  id: string;
  email: string;
  password: string;
  codeVerification: string | null;
  isVerified: boolean;
  role: RoleEnum;
  createdAt: string | null;
  updatedAt: string | null;
}

export type CreateUser = Pick<
  User,
  'email' | 'password' | 'role' | 'isVerified'
>;
