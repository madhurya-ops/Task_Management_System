import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';

describe('auth guards', () => {
  it('rejects tasks endpoint without token', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
