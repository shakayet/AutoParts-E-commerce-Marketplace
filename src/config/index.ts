import dotenv from 'dotenv';
import os from 'os';
import path from 'path';
import process from 'process';
import { z } from 'zod';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
  override: false,
});

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    DATABASE_URL: z.string().min(1),
    PORT: z.coerce.number().int().min(1).max(65535).default(5001),
    IP_ADDRESS: z.string().default('0.0.0.0'),
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRE_IN: z.string().min(1).default('1d'),
    JWT_REFRESH_SECRET: z.string().min(32).optional(),
    JWT_REFRESH_EXPIRE_IN: z.string().min(1).default('30d'),
    EMAIL_FROM: z.string().email().optional(),
    EMAIL_FROM_NAME: z.string().default('Jbay'),
    AWS_REGION: z.string().default('us-east-1'),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_BUCKET: z.string().optional(),
    CLOUDFRONT_DOMAIN: z.string().optional(),
    BRAND_LOGO_URL: z.string().url().optional(),
    PROJECT_NAME: z.string().default('JBAY'),
    SUPER_ADMIN_EMAIL: z.string().email().optional(),
    SUPER_ADMIN_PASSWORD: z.string().min(1).optional(),
    CORS_ORIGINS: z.string().optional(),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    RATE_LIMIT_MESSAGE: z
      .string()
      .default('Too many requests from this IP, please try again later.'),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return;
    if (env.JWT_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET must contain at least 32 characters in production',
      });
    }
    if (env.SUPER_ADMIN_PASSWORD && env.SUPER_ADMIN_PASSWORD.length < 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SUPER_ADMIN_PASSWORD'],
        message:
          'SUPER_ADMIN_PASSWORD must contain at least 12 characters in production',
      });
    }
    const required: (keyof typeof env)[] = [
      'JWT_REFRESH_SECRET',
      'EMAIL_FROM',
      'AWS_BUCKET',
      'CORS_ORIGINS',
      'SUPER_ADMIN_EMAIL',
      'SUPER_ADMIN_PASSWORD',
    ];
    for (const key of required) {
      if (!env[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} is required in production`,
        });
      }
    }
    if (env.JWT_REFRESH_SECRET === env.JWT_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_REFRESH_SECRET'],
        message: 'JWT_REFRESH_SECRET must differ from JWT_SECRET',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues
    .map(issue => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid environment configuration: ${details}`);
}
const env = parsed.data;

const resolveListenAddress = (requested: string): string => {
  if (['0.0.0.0', 'localhost', '127.0.0.1'].includes(requested))
    return requested;
  const localIps = new Set<string>(['localhost', '127.0.0.1', '0.0.0.0', '::']);
  Object.values(os.networkInterfaces()).forEach(interfaces => {
    interfaces?.forEach(network => {
      if (!network.internal && network.family === 'IPv4') {
        localIps.add(network.address);
      }
    });
  });
  return localIps.has(requested) ? requested : '0.0.0.0';
};

const corsOrigins = env.CORS_ORIGINS
  ? env.CORS_ORIGINS.split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
  : env.NODE_ENV === 'production'
    ? []
    : ['*'];

const config = {
  ip_address: resolveListenAddress(env.IP_ADDRESS),
  database_url: env.DATABASE_URL,
  node_env: env.NODE_ENV,
  port: env.PORT,
  bcrypt_salt_rounds: env.BCRYPT_SALT_ROUNDS,
  corsOrigins,
  jwt: {
    jwt_secret: env.JWT_SECRET,
    jwt_expire_in: env.JWT_EXPIRE_IN,
    refresh_secret: env.JWT_REFRESH_SECRET || env.JWT_SECRET,
    refresh_expire_in: env.JWT_REFRESH_EXPIRE_IN,
  },
  email: {
    from: env.EMAIL_FROM,
    fromName: env.EMAIL_FROM_NAME,
  },
  aws: {
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    bucket: env.AWS_BUCKET,
    cloudFrontDomain: env.CLOUDFRONT_DOMAIN,
  },
  branding: {
    logoUrl: env.BRAND_LOGO_URL,
    projectName: env.PROJECT_NAME,
  },
  super_admin: {
    email: env.SUPER_ADMIN_EMAIL,
    password: env.SUPER_ADMIN_PASSWORD,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: env.RATE_LIMIT_MESSAGE,
  },
};

export default config;
