import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '@shared/utils/app-error';
import { HTTP_STATUS } from '@shared/constants';

type RequestPart = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, part: RequestPart = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const errors: Record<string, string[]> = {};

      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.') || 'root';
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      });

      next(new AppError('Validation failed', HTTP_STATUS.UNPROCESSABLE_ENTITY, errors));
      return;
    }

    if (part === 'query' || part === 'params') {
      Object.defineProperty(req, part, {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req[part] = result.data;
    }

    next();
  };
