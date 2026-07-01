import { z } from 'zod';
import { USER_ROLES } from '@shared/constants';
import { ORDER_STATUS } from '@shared/constants/order.constants';
import { objectIdSchema, paginationQuerySchema } from '@shared/validators';

export const adminUserListQuerySchema = paginationQuerySchema.extend({
  role: z.enum([USER_ROLES.CUSTOMER, USER_ROLES.STAFF, USER_ROLES.SUPER_ADMIN]).optional(),
  isActive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional(),
  search: z.string().trim().min(1).optional(),
});

export const adminUserIdParamSchema = z.object({
  id: objectIdSchema,
});

export const updateUserRoleSchema = z.object({
  role: z.enum([USER_ROLES.CUSTOMER, USER_ROLES.STAFF, USER_ROLES.SUPER_ADMIN]),
});

export const updateUserStatusSchema = z.object({
  isActive: z.union([z.boolean(), z.enum(['true', 'false'])]).transform((val) => {
    return val === true || val === 'true';
  }),
});

export const adminProductListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isActive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional(),
});

export const adminProductIdParamSchema = z.object({
  id: objectIdSchema,
});

export const updateProductStockSchema = z.object({
  stockQuantity: z.coerce.number().int().min(0, 'Stock quantity cannot be negative'),
});

export const adminOrderListQuerySchema = paginationQuerySchema.extend({
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

export const adminOrderIdParamSchema = z.object({
  id: objectIdSchema,
});

export const adminUpdateOrderStatusSchema = z.object({
  status: z.enum([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
  ]),
});
