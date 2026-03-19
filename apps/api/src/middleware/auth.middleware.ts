import type { NextFunction, Request, Response } from 'express';
import { unauthorized } from '../lib/errors';
import { verifyAccessToken } from '../lib/jwt';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(unauthorized('Missing or invalid Authorization header'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyAccessToken(token);

    if (payload.type !== 'access') {
      return next(unauthorized('Invalid token type'));
    }

    req.user = payload;
    return next();
  } catch {
    return next(unauthorized('Invalid or expired access token'));
  }
};
