import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { REQUEST_ID_HEADER } from '@shared/constants';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incomingId = req.headers[REQUEST_ID_HEADER.toLowerCase()];
  const requestId =
    typeof incomingId === 'string' && incomingId.trim().length > 0 ? incomingId : randomUUID();

  req.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
};
