import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { corsOptions } from '@shared/config/cors';
import { API_VERSION } from '@shared/constants';
import { requestIdMiddleware } from '@shared/middleware/request-id.middleware';
import { loggerMiddleware } from '@shared/middleware/logger.middleware';
import { apiRateLimiter } from '@shared/middleware/rate-limit.middleware';
import { errorHandler } from '@shared/middleware/error.middleware';
import { notFoundHandler } from '@shared/middleware/not-found.middleware';
import { healthModule } from '@modules/health/health.module';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(requestIdMiddleware);
app.use(loggerMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());
app.use(apiRateLimiter);

app.use(`/api/${API_VERSION}`, healthModule());

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
