import { Request, Response, NextFunction } from 'express';

/**
 * Placeholder authorization middleware.
 * Role-based access control will be implemented in a future auth module.
 */
export const authorize =
  (..._roles: string[]) =>
  (_req: Request, _res: Response, next: NextFunction): void => {
    next();
  };
