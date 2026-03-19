import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject } from 'zod';
import { badRequest } from '../lib/errors';

export const validate = (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (!result.success) {
    return next(badRequest('Validation failed', result.error.flatten()));
  }

  req.body = result.data.body;
  req.query = result.data.query;
  req.params = result.data.params;
  return next();
};
