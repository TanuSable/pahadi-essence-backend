import { Request, Response, NextFunction } from 'express';

/**
 * Placeholder authentication middleware.
 * JWT verification will be implemented in a future auth module.
 */
export const authenticate = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};
