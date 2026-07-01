import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/utils/app-error';
import { HTTP_STATUS } from '@shared/constants';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, HTTP_STATUS.NOT_FOUND));
};
