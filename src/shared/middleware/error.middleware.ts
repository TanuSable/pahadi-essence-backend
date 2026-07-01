import { Error as MongooseError } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/utils/app-error';
import { isProduction } from '@shared/config/env';
import { logger } from '@shared/logger/logger';
import { HTTP_STATUS } from '@shared/constants';

const formatMongooseValidationErrors = (
  error: MongooseError.ValidationError,
): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  Object.values(error.errors).forEach((fieldError) => {
    const path = fieldError.path || 'root';
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(fieldError.message);
  });

  return errors;
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  if (err instanceof MongooseError.ValidationError) {
    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: 'Validation failed',
      errors: formatMongooseValidationErrors(err),
    });
    return;
  }

  if (err.name === 'CastError') {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Invalid identifier format',
    });
    return;
  }

  if ('code' in err && (err as { code?: number }).code === 11000) {
    res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'Duplicate entry',
    });
    return;
  }

  logger.error(
    {
      err,
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      ...(isProduction ? {} : { stack: err.stack }),
    },
    'Unhandled error',
  );

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: isProduction ? 'Internal server error' : err.message,
  });
};
