import { Response, CookieOptions } from 'express';
import { isProduction } from '@shared/config/env';
import { COOKIE_NAMES } from '@shared/constants';

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  path: '/',
};

export const setAccessTokenCookie = (res: Response, token: string, maxAgeMs: number): void => {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, token, {
    ...baseCookieOptions,
    maxAge: maxAgeMs,
  });
};

export const setRefreshTokenCookie = (res: Response, token: string, maxAgeMs: number): void => {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, {
    ...baseCookieOptions,
    maxAge: maxAgeMs,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, baseCookieOptions);
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, baseCookieOptions);
};
