import type { CookieOptions, Response } from 'express';
import { env, isProduction } from '../config/env';

const refreshCookieName = 'refreshToken';

const parseExpiryToMs = (value: string): number => {
  const trimmed = value.trim();
  const match = /^(\d+)([smhd])$/.exec(trimmed);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return amount * unitMs[unit];
};

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE || isProduction,
  sameSite: 'strict',
  path: '/auth',
  maxAge: parseExpiryToMs(env.JWT_REFRESH_EXPIRES_IN)
};

export const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(refreshCookieName, token, cookieOptions);
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie(refreshCookieName, cookieOptions);
};

export const getRefreshCookieName = () => refreshCookieName;
