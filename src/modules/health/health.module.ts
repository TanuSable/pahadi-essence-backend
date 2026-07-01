import { Router } from 'express';
import healthRoutes from '@modules/health/routes/health.routes';

export const healthModule = (): Router => {
  const router = Router();
  router.use('/health', healthRoutes);
  return router;
};
