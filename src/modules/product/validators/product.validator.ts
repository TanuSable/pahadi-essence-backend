import { z } from 'zod';
import { objectIdSchema } from '@shared/validators';
import { PAGINATION } from '@shared/constants';

const productBaseSchema = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(200),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  category: z.string().trim().min(2, 'Category must be at least 2 characters').max(100),
  images: z.array(z.string().url('Each image must be a valid URL')).optional(),
  videos: z.array(z.string().url('Each video must be a valid URL')).optional(),
  stockQuantity: z.coerce.number().int().min(0, 'Stock quantity cannot be negative'),
  maxOrderLimitPerUser: z.coerce
    .number()
    .int()
    .min(1, 'Max order limit per user must be at least 1'),
  isActive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional(),
};

export const createProductSchema = z.object(productBaseSchema);

export const updateProductSchema = z.object({
  name: productBaseSchema.name.optional(),
  description: productBaseSchema.description.optional(),
  price: productBaseSchema.price.optional(),
  category: productBaseSchema.category.optional(),
  images: productBaseSchema.images,
  videos: productBaseSchema.videos,
  stockQuantity: productBaseSchema.stockQuantity.optional(),
  maxOrderLimitPerUser: productBaseSchema.maxOrderLimitPerUser.optional(),
  isActive: productBaseSchema.isActive,
});

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isActive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional(),
  includeInactive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional(),
});

export const productIdParamSchema = z.object({
  id: objectIdSchema,
});
