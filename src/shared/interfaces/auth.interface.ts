import { UserRole } from '@shared/constants';

export interface JwtAccessPayload {
  sub: string;
  role: UserRole;
  email?: string;
  phone?: string;
}

export interface JwtRefreshPayload {
  sub: string;
  tokenId: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
