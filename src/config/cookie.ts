import { env } from './config';
import type { CookieOptions } from 'express';

const isProduction = env.NODE_ENV === 'production';

export const commonOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};
