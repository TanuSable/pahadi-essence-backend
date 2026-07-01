import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '@shared/config/env';
import { JwtAccessPayload, JwtRefreshPayload } from '@shared/interfaces/auth.interface';

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const tokenService = {
  generateAccessToken(payload: JwtAccessPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as jwt.SignOptions);
  },

  generateRefreshToken(userId: string): { token: string; tokenId: string } {
    const tokenId = randomUUID();
    const token = jwt.sign({ sub: userId, tokenId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);

    return { token, tokenId };
  },

  verifyAccessToken(token: string): JwtAccessPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
  },

  verifyRefreshToken(token: string): JwtRefreshPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
  },

  getAccessTokenMaxAgeMs(): number {
    return ACCESS_TOKEN_MAX_AGE_MS;
  },

  getRefreshTokenMaxAgeMs(): number {
    return REFRESH_TOKEN_MAX_AGE_MS;
  },
};
