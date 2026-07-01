import { Router, Request, Response, NextFunction } from 'express';
import { productController } from '@modules/product/controller/product.controller';
import {
  createProductSchema,
  updateProductSchema,
  productListQuerySchema,
  productIdParamSchema,
} from '@modules/product/validators/product.validator';
import { validate } from '@shared/middleware/validation.middleware';
import { authenticate } from '@shared/middleware/authentication.middleware';
import { authorize } from '@shared/middleware/role.middleware';
import { USER_ROLES, COOKIE_NAMES } from '@shared/constants';
import { tokenService } from '@modules/auth/service/token.service';
import { productMediaUpload } from '@modules/product/middleware/upload.middleware';

const productRoutes = Router();

/**
 * Optionally attaches user context when a valid access token cookie is present.
 * Public product routes remain accessible without authentication.
 */
const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN] as string | undefined;
    if (!token) {
      next();
      return;
    }

    const payload = tokenService.verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      phone: payload.phone,
    };
    next();
  } catch {
    next();
  }
};

const staffOrAdmin = [authenticate, authorize(USER_ROLES.STAFF, USER_ROLES.SUPER_ADMIN)];

productRoutes.post(
  '/',
  ...staffOrAdmin,
  productMediaUpload,
  validate(createProductSchema),
  productController.createProduct,
);

productRoutes.get(
  '/',
  optionalAuthenticate,
  validate(productListQuerySchema, 'query'),
  productController.getProducts,
);

productRoutes.get(
  '/:id',
  optionalAuthenticate,
  validate(productIdParamSchema, 'params'),
  productController.getProductById,
);

productRoutes.put(
  '/:id',
  ...staffOrAdmin,
  validate(productIdParamSchema, 'params'),
  productMediaUpload,
  validate(updateProductSchema),
  productController.updateProduct,
);

productRoutes.delete(
  '/:id',
  ...staffOrAdmin,
  validate(productIdParamSchema, 'params'),
  productController.deleteProduct,
);

export default productRoutes;
