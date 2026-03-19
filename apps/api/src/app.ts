import type { Request, RequestHandler, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env';
import { authRouter } from './modules/auth/auth.routes';
import { tasksRouter } from './modules/tasks/tasks.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

export const app = express();

const authRequestWindowMs = 60_000;
const authRequestMax = 30;
const authBuckets = new Map<string, { count: number; resetAt: number }>();

const authRateLimitMiddleware: RequestHandler = (req, res, next) => {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const bucket = authBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    authBuckets.set(key, { count: 1, resetAt: now + authRequestWindowMs });
    return next();
  }

  if (bucket.count >= authRequestMax) {
    return res.status(429).json({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many auth requests. Please try again later.'
      }
    });
  }

  bucket.count += 1;
  return next();
};

app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGIN,
    credentials: true
  })
);

// Middleware isolation toggle: set DISABLE_BODY_PARSERS=true to skip parser middleware.
if (process.env.DISABLE_BODY_PARSERS !== 'true') {
  app.use(express.json({ limit: '32kb' }));
  app.use(express.urlencoded({ extended: true, limit: '32kb' }));
}

app.use(cookieParser());
if (env.NODE_ENV === 'development' && process.env.HTTP_LOGS === 'true') {
  // Lazy-load logger only when explicitly enabled to avoid dev overhead by default.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const morgan = require('morgan') as typeof import('morgan');
  app.use(morgan('dev'));
}
app.use('/auth', authRateLimitMiddleware);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);

app.use(notFoundHandler);
app.use(errorHandler);
