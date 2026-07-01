import { Request } from 'express';
import pinoHttp from 'pino-http';
import { logger } from '@shared/logger/logger';
import { REQUEST_ID_HEADER } from '@shared/constants';

export const loggerMiddleware = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const expressReq = req as Request;
    const existingId = req.headers[REQUEST_ID_HEADER.toLowerCase()];
    if (typeof existingId === 'string' && existingId.trim().length > 0) {
      return existingId;
    }

    const generatedId = expressReq.requestId;
    res.setHeader(REQUEST_ID_HEADER, generatedId);
    return generatedId;
  },
  customProps: (req) => ({
    requestId: (req as Request).requestId,
  }),
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
});
