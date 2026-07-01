import { Request, Response, NextFunction } from 'express';
import { tokenService } from '@modules/auth/service/token.service';
import { AppError } from '@shared/utils/app-error';
import { HTTP_STATUS, COOKIE_NAMES } from '@shared/constants';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN] as string | undefined;

    if (!token) {
      throw new AppError('Access token not found', HTTP_STATUS.UNAUTHORIZED);
    }

    const payload = tokenService.verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      phone: payload.phone,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError('Invalid or expired access token', HTTP_STATUS.UNAUTHORIZED));
  }
};
