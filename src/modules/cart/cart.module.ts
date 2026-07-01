import { Router } from 'express';
import cartRoutes from '@modules/cart/routes/cart.routes';

export const cartModule = (): Router => {
  const router = Router();
  router.use('/cart', cartRoutes);
  return router;
};
