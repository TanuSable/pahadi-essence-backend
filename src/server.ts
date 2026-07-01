import app from '@/app';
import { connectDatabase, disconnectDatabase } from '@shared/config/database';
import { env } from '@shared/config/env';
import { logger } from '@shared/logger/logger';
import '@shared/config/cloudinary';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const startServer = async (): Promise<void> => {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — starting graceful shutdown`);

    const forceExitTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    server.close(async () => {
      try {
        await disconnectDatabase();
        clearTimeout(forceExitTimer);
        logger.info('Server shut down gracefully');
        process.exit(0);
      } catch (error) {
        logger.error({ err: error }, 'Error during graceful shutdown');
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
};

startServer().catch((error) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
