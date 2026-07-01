import { Router } from 'express';
import productRoutes from '@modules/product/routes/product.routes';

export const productModule = (): Router => {
  const router = Router();
  router.use('/products', productRoutes);
  return router;
};
