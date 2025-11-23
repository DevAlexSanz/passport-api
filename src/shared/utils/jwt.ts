import jwt from 'jsonwebtoken';
import { env } from '@config/config';

export const generateToken = ({
  id,
  email,
  role,
  pharmacyId,
}: {
  id: string;
  email: string;
  role: string;
  pharmacyId?: string;
}): {
  accessToken: string;
  refreshToken: string;
} => {
  const accessToken = jwt.sign({ id, email, role, pharmacyId }, env.TOKEN_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ id }, env.TOKEN_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};
