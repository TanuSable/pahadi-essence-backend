import { Router } from 'express';
import orderRoutes from '@modules/order/routes/order.routes';

export const orderModule = (): Router => {
  const router = Router();
  router.use('/orders', orderRoutes);
  return router;
};
