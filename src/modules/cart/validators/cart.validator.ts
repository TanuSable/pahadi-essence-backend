import { z } from 'zod';
import { objectIdSchema } from '@shared/validators';

export const addToCartSchema = z.object({
  productId: objectIdSchema,
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  productId: objectIdSchema,
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

export const cartProductIdParamSchema = z.object({
  id: objectIdSchema,
});
