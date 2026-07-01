import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/utils/app-error';
import { HTTP_STATUS, UserRole } from '@shared/constants';

export const authorize =
  (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError('You do not have permission to perform this action', HTTP_STATUS.FORBIDDEN));
      return;
    }

    next();
  };
