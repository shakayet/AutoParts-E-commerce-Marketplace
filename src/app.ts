import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import rateLimiter from './app/middlewares/rateLimiter';
import router from './routes';
import { Morgan } from './shared/morgen';
import config from './config';
import mongoose from 'mongoose';
const app = express();

// Trust the first reverse proxy (Nginx)
app.set('trust proxy', 1);

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

// Helmet for security headers
app.use(helmet());

// Apply rate limiter to all requests
app.use(rateLimiter);

//body parser
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        config.corsOrigins.includes('*') ||
        config.corsOrigins.includes(origin)
      ) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin is not allowed by CORS'));
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// file retrieval is handled by CloudFront; we no longer serve from local uploads directory

//router
app.use('/api/v1', router);

//live response
app.get('/', (req: Request, res: Response) => {
  const date = new Date(Date.now());
  res.send(
    `<h1 style="text-align:center; color:#173616; font-family:Verdana;">Beep-beep! The server is alive and kicking.</h1>
    <p style="text-align:center; color:#173616; font-family:Verdana;">${date}</p>
    `,
  );
});

app.get('/health', (_req: Request, res: Response) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE).json({
    success: ready,
    message: ready ? 'Service is healthy' : 'Service is not ready',
  });
});

//global error handle
app.use(globalErrorHandler);

//handle not found route;
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;
