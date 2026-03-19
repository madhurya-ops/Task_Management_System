import type { Request, Response } from 'express';
import { clearRefreshCookie, getRefreshCookieName, setRefreshCookie } from '../../lib/cookies';
import { unauthorized } from '../../lib/errors';
import { authService } from './auth.service';

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body, req);
    setRefreshCookie(res, result.refreshToken);

    return res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
      accessTokenExpiresIn: result.accessTokenExpiresIn
    });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body, req);
    setRefreshCookie(res, result.refreshToken);

    return res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
      accessTokenExpiresIn: result.accessTokenExpiresIn
    });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies[getRefreshCookieName()];
    const result = await authService.refresh(token, req);
    setRefreshCookie(res, result.refreshToken);

    return res.status(200).json({
      accessToken: result.accessToken,
      accessTokenExpiresIn: result.accessTokenExpiresIn
    });
  },

  async logout(req: Request, res: Response) {
    const token = req.cookies[getRefreshCookieName()];
    await authService.logout(token);
    clearRefreshCookie(res);
    return res.status(204).send();
  },

  async me(req: Request, res: Response) {
    if (!req.user?.sub) {
      throw unauthorized('Unauthorized');
    }

    const user = await authService.me(req.user.sub);
    return res.status(200).json({ user });
  }
};
