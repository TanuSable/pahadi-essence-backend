import { UserRole } from '@shared/constants';

export interface RegisterDto {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role?: UserRole;
}

export interface LoginDto {
  email?: string;
  phone?: string;
  password: string;
}

export interface AuthResponseDto {
  user: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role: UserRole;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}
