import rateLimit from 'express-rate-limit';
import config from '../../config';

const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    statusCode: 429,
    message: config.rateLimit.message,
    errorMessages: [
      {
        path: '',
        message: config.rateLimit.message,
      },
    ],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
