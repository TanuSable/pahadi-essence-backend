import { Router } from 'express';
import adminRoutes from '@modules/admin/routes/admin.routes';

export const adminModule = (): Router => {
  const router = Router();
  router.use('/admin', adminRoutes);
  return router;
};
