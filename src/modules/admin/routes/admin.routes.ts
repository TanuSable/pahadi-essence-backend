import { Router } from 'express';
import { adminController } from '@modules/admin/controller/admin.controller';
import {
  adminUserListQuerySchema,
  adminUserIdParamSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  adminProductListQuerySchema,
  adminProductIdParamSchema,
  updateProductStockSchema,
  adminOrderListQuerySchema,
  adminOrderIdParamSchema,
  adminUpdateOrderStatusSchema,
} from '@modules/admin/validators/admin.validator';
import { validate } from '@shared/middleware/validation.middleware';
import { authenticate } from '@shared/middleware/authentication.middleware';
import { authorize } from '@shared/middleware/role.middleware';
import { USER_ROLES } from '@shared/constants';

const adminRoutes = Router();

adminRoutes.use(authenticate, authorize(USER_ROLES.STAFF, USER_ROLES.SUPER_ADMIN));

adminRoutes.get('/dashboard', adminController.getDashboard);

adminRoutes.get('/users', validate(adminUserListQuerySchema, 'query'), adminController.getUsers);
adminRoutes.get(
  '/users/:id',
  validate(adminUserIdParamSchema, 'params'),
  adminController.getUserById,
);
adminRoutes.patch(
  '/users/:id/role',
  authorize(USER_ROLES.SUPER_ADMIN),
  validate(adminUserIdParamSchema, 'params'),
  validate(updateUserRoleSchema),
  adminController.updateUserRole,
);
adminRoutes.patch(
  '/users/:id/status',
  validate(adminUserIdParamSchema, 'params'),
  validate(updateUserStatusSchema),
  adminController.updateUserStatus,
);

adminRoutes.get(
  '/products',
  validate(adminProductListQuerySchema, 'query'),
  adminController.getProducts,
);
adminRoutes.patch(
  '/products/:id/activate',
  validate(adminProductIdParamSchema, 'params'),
  adminController.activateProduct,
);
adminRoutes.patch(
  '/products/:id/deactivate',
  validate(adminProductIdParamSchema, 'params'),
  adminController.deactivateProduct,
);
adminRoutes.patch(
  '/products/:id/stock',
  validate(adminProductIdParamSchema, 'params'),
  validate(updateProductStockSchema),
  adminController.updateProductStock,
);

adminRoutes.get('/orders', validate(adminOrderListQuerySchema, 'query'), adminController.getOrders);
adminRoutes.get(
  '/orders/:id',
  validate(adminOrderIdParamSchema, 'params'),
  adminController.getOrderById,
);
adminRoutes.patch(
  '/orders/:id/status',
  validate(adminOrderIdParamSchema, 'params'),
  validate(adminUpdateOrderStatusSchema),
  adminController.updateOrderStatus,
);

export default adminRoutes;
