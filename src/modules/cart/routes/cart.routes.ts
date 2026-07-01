import { Router } from 'express';
import { cartController } from '@modules/cart/controller/cart.controller';
import {
  addToCartSchema,
  updateCartItemSchema,
  cartProductIdParamSchema,
} from '@modules/cart/validators/cart.validator';
import { validate } from '@shared/middleware/validation.middleware';
import { authenticate } from '@shared/middleware/authentication.middleware';

const cartRoutes = Router();

cartRoutes.use(authenticate);

cartRoutes.post('/add', validate(addToCartSchema), cartController.addToCart);
cartRoutes.get('/', cartController.getCart);
cartRoutes.put('/update', validate(updateCartItemSchema), cartController.updateCartItem);
cartRoutes.delete(
  '/remove/:id',
  validate(cartProductIdParamSchema, 'params'),
  cartController.removeFromCart,
);
cartRoutes.delete('/clear', cartController.clearCart);

export default cartRoutes;
