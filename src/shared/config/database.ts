import mongoose from 'mongoose';
import { env } from '@shared/config/env';
import { DATABASE_RETRY } from '@shared/constants';
import { logger } from '@shared/logger/logger';

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const registerConnectionEvents = (): void => {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });

  mongoose.connection.on('error', (error) => {
    logger.error({ err: error }, 'MongoDB connection error');
  });
};

export const connectDatabase = async (
  retriesLeft: number = DATABASE_RETRY.MAX_ATTEMPTS,
): Promise<void> => {
  registerConnectionEvents();

  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    if (retriesLeft <= 1) {
      logger.error({ err: error }, 'MongoDB connection failed after all retry attempts');
      process.exit(1);
    }

    const attempt = DATABASE_RETRY.MAX_ATTEMPTS - retriesLeft + 1;
    logger.warn(
      { attempt, retriesLeft: retriesLeft - 1 },
      `MongoDB connection failed — retrying in ${DATABASE_RETRY.DELAY_MS}ms`,
    );

    await sleep(DATABASE_RETRY.DELAY_MS);
    await connectDatabase(retriesLeft - 1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.connection.close();
  logger.info('MongoDB disconnected gracefully');
};

export const getDatabaseStatus = (): string => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return states[mongoose.connection.readyState] ?? 'unknown';
};
