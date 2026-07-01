import { UserRole } from '@shared/constants';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: {
        id: string;
        role: UserRole;
        email?: string;
        phone?: string;
      };
    }
  }
}

export {};
