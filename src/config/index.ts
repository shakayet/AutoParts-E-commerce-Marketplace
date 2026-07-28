import dotenv from 'dotenv';
import path from 'path';
import process from 'process';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  ip_address: process.env.IP_ADDRESS,
  database_url: process.env.DATABASE_URL,
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expire_in: process.env.JWT_EXPIRE_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    refresh_expire_in:
      process.env.JWT_REFRESH_EXPIRE_IN || process.env.JWT_EXPIRE_IN,
  },
  email: {
    from: process.env.EMAIL_FROM,
    fromName: process.env.EMAIL_FROM_NAME || 'Jbay',
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_BUCKET,
    cloudFrontDomain: process.env.CLOUDFRONT_DOMAIN,
  },
  branding: {
    logoUrl: process.env.BRAND_LOGO_URL,
    projectName: process.env.PROJECT_NAME || 'JBAY',
  },
  super_admin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
    message: process.env.RATE_LIMIT_MESSAGE || 'Too many requests from this IP, please try again later.',
  },
};
