import { Response } from 'express';
import { authRepository } from '@modules/auth/repository/auth.repository';
import { tokenService } from '@modules/auth/service/token.service';
import { LoginDto, RegisterDto } from '@modules/auth/dto/auth.dto';
import { AppError } from '@shared/utils/app-error';
import { HTTP_STATUS } from '@shared/constants';
import {
  clearAuthCookies,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '@shared/helpers/cookie.helper';
import { hashToken } from '@shared/helpers/token-hash.helper';
import { AuthUser } from '@shared/interfaces/auth.interface';

const isDuplicateKeyError = (error: unknown): boolean => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: number }).code === 11000
  );
};

const getDuplicateFieldMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'keyPattern' in error) {
    const keyPattern = (error as { keyPattern: Record<string, number> }).keyPattern;
    if (keyPattern.email) return 'Email is already registered';
    if (keyPattern.phone) return 'Phone number is already registered';
  }
  return 'User already exists';
};

export const authService = {
  async register(data: RegisterDto, res: Response): Promise<AuthUser> {
    try {
      const user = await authRepository.createUser(data);
      await this.issueTokens(user, res);
      return authRepository.toAuthUser(user);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AppError(getDuplicateFieldMessage(error), HTTP_STATUS.CONFLICT);
      }
      throw error;
    }
  },

  async login(data: LoginDto, res: Response): Promise<AuthUser> {
    const user = data.email
      ? await authRepository.findByEmail(data.email)
      : await authRepository.findByPhone(data.phone!);

    if (!user) {
      throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);
    }

    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);
    }

    await this.issueTokens(user, res);
    return authRepository.toAuthUser(user);
  },

  async logout(userId: string, res: Response): Promise<void> {
    await authRepository.updateRefreshToken(userId, null);
    clearAuthCookies(res);
  },

  async refresh(refreshToken: string, res: Response): Promise<void> {
    let payload;

    try {
      payload = tokenService.verifyRefreshToken(refreshToken);
    } catch {
      clearAuthCookies(res);
      throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await authRepository.findByIdWithRefreshToken(payload.sub);

    if (!user || !user.refreshToken) {
      clearAuthCookies(res);
      throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
    }

    const hashedIncoming = hashToken(refreshToken);
    if (user.refreshToken !== hashedIncoming) {
      await authRepository.updateRefreshToken(user._id.toString(), null);
      clearAuthCookies(res);
      throw new AppError('Refresh token reuse detected', HTTP_STATUS.UNAUTHORIZED);
    }

    await this.issueTokens(user, res);
  },

  async getMe(userId: string): Promise<AuthUser> {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    return authRepository.toAuthUser(user);
  },

  async issueTokens(user: { _id: { toString(): string }; role: string; email?: string; phone?: string }, res: Response): Promise<void> {
    const userId = user._id.toString();

    const accessToken = tokenService.generateAccessToken({
      sub: userId,
      role: user.role as AuthUser['role'],
      email: user.email,
      phone: user.phone,
    });

    const { token: refreshToken } = tokenService.generateRefreshToken(userId);
    const hashedRefreshToken = hashToken(refreshToken);

    await authRepository.updateRefreshToken(userId, hashedRefreshToken);

    setAccessTokenCookie(res, accessToken, tokenService.getAccessTokenMaxAgeMs());
    setRefreshTokenCookie(res, refreshToken, tokenService.getRefreshTokenMaxAgeMs());
  },
};
