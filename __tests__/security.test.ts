import request from 'supertest';
import { describe, expect, it } from '@jest/globals';
import app from '../src/app';
import { User } from '../src/app/modules/user/user.model';
import { UserRoutes } from '../src/app/modules/user/user.route';
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

  it('matches the delete-account route before the parameterized user route', () => {
    const routePaths = UserRoutes.stack
      .map(layer => layer.route?.path)
      .filter((path): path is string => typeof path === 'string');

    expect(routePaths.indexOf('/delete-account')).toBeLessThan(
      routePaths.indexOf('/:id'),
    );
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
