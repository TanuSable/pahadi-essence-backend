import { Router } from 'express';
import authRoutes from '@modules/auth/routes/auth.routes';

export const authModule = (): Router => {
  const router = Router();
  router.use('/auth', authRoutes);
  return router;
};
