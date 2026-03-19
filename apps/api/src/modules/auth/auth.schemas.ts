import { z } from 'zod';

const email = z.string().trim().toLowerCase().email();
const password = z.string().min(8).max(128);

export const registerSchema = z.object({
  body: z.object({
    email,
    password,
    name: z.string().trim().min(1).max(120).optional()
  }),
  query: z.object({}),
  params: z.object({})
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password
  }),
  query: z.object({}),
  params: z.object({})
});

export const refreshSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({}),
  params: z.object({})
});

export const logoutSchema = refreshSchema;

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
