import { z } from 'zod';
import { ORDER_STATUS } from '@shared/constants/order.constants';
import { objectIdSchema, paginationQuerySchema } from '@shared/validators';

const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'),
  addressLine1: z.string().trim().min(5, 'Address line 1 is required'),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Please provide a valid 6-digit pincode'),
});

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema.optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
  ]),
});

export const orderIdParamSchema = z.object({
  id: objectIdSchema,
});

export const orderListQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum([
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.OUT_FOR_DELIVERY,
      ORDER_STATUS.DELIVERED,
      ORDER_STATUS.CANCELLED,
    ])
    .optional(),
});
