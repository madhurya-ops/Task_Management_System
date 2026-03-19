import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../lib/async-handler';
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from './auth.schemas';
import { authMiddleware } from '../../middleware/auth.middleware';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), asyncHandler(authController.register));
authRouter.post('/login', validate(loginSchema), asyncHandler(authController.login));
authRouter.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh));
authRouter.post('/logout', validate(logoutSchema), asyncHandler(authController.logout));
authRouter.get('/me', authMiddleware, asyncHandler(authController.me));
