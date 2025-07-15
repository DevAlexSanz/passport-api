import jwt from 'jsonwebtoken';
import { env } from '@config/config';

export const generateToken = ({
  id,
  email,
  role,
}: {
  id: string;
  email: string;
  role: string;
}): {
  accessToken: string;
  refreshToken: string;
} => {
  const accessToken = jwt.sign({ id, email, role }, env.TOKEN_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ id, email, role }, env.TOKEN_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};
