import { Request, Response } from 'express';
import { sendSuccess } from '@shared/utils/api-response';
import { asyncHandler } from '@shared/utils/async-handler';
import { healthService } from '@modules/health/service/health.service';

export const healthController = {
  getHealth: asyncHandler(async (_req: Request, res: Response) => {
    const data = healthService.getHealthStatus();
    sendSuccess(res, 'Server is healthy', data);
  }),
};
