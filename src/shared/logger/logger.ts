import pino from 'pino';
import { env, isDevelopment } from '@shared/config/env';

export const logger = pino({
  level: env.LOG_LEVEL,
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});
