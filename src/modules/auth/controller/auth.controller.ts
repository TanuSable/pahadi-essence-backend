import { Request, Response } from 'express';
import { sendSuccess } from '@shared/utils/api-response';
import { asyncHandler } from '@shared/utils/async-handler';
import { authService } from '@modules/auth/service/auth.service';
import { HTTP_STATUS, COOKIE_NAMES } from '@shared/constants';
import { AppError } from '@shared/utils/app-error';
import { RegisterDto, LoginDto } from '@modules/auth/dto/auth.dto';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body as RegisterDto, res);
    sendSuccess(res, 'Registration successful', { user }, HTTP_STATUS.CREATED);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.login(req.body as LoginDto, res);
    sendSuccess(res, 'Login successful', { user });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    }

    await authService.logout(req.user.id, res);
    sendSuccess(res, 'Logout successful', null);
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] as string | undefined;

    if (!refreshToken) {
      throw new AppError('Refresh token not found', HTTP_STATUS.UNAUTHORIZED);
    }

    await authService.refresh(refreshToken, res);
    sendSuccess(res, 'Token refreshed successfully', null);
  }),

  getMe: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await authService.getMe(req.user.id);
    sendSuccess(res, 'User profile retrieved', { user });
  }),
};
