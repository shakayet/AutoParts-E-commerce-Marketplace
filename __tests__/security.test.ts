import request from 'supertest';
import { describe, expect, it } from '@jest/globals';
import app from '../src/app';
import { User } from '../src/app/modules/user/user.model';
import { UserValidation } from '../src/app/modules/user/user.validation';

describe('security invariants', () => {
  it('does not select password fields by default', () => {
    expect(User.schema.path('password').options.select).toBe(false);
  });

  it('rejects short passwords at the API validation boundary', () => {
    const result = UserValidation.createUserZodSchema.safeParse({
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
      },
    });
    expect(result.success).toBe(false);
  });

  it('keeps the health response format stable when the database is unavailable', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      success: false,
      message: 'Service is not ready',
    });
  });
});
