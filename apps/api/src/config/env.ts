import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const rawEnv = { ...process.env };

if (rawEnv.NODE_ENV === 'test') {
  rawEnv.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/task_management_test';
  rawEnv.JWT_ACCESS_SECRET ??= 'test-access-secret-minimum-32-characters';
  rawEnv.JWT_REFRESH_SECRET ??= 'test-refresh-secret-minimum-32-characters';
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  ALLOWED_ORIGIN: z.string().url().default('http://localhost:3000')
});

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables', parsed.error.flatten().fieldErrors);
  if (rawEnv.NODE_ENV === 'test') {
    throw new Error('Invalid environment variables for test environment');
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
