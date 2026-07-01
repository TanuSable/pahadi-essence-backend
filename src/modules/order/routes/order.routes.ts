import { Router } from 'express';
import { orderController } from '@modules/order/controller/order.controller';
import {
  checkoutSchema,
  updateOrderStatusSchema,
  orderIdParamSchema,
  orderListQuerySchema,
} from '@modules/order/validators/order.validator';
import { validate } from '@shared/middleware/validation.middleware';
import { authenticate } from '@shared/middleware/authentication.middleware';
import { authorize } from '@shared/middleware/role.middleware';
import { USER_ROLES } from '@shared/constants';

const orderRoutes = Router();

orderRoutes.use(authenticate);

orderRoutes.post('/checkout', validate(checkoutSchema), orderController.checkout);
orderRoutes.get('/', validate(orderListQuerySchema, 'query'), orderController.getOrders);
orderRoutes.get(
  '/:id',
  validate(orderIdParamSchema, 'params'),
  orderController.getOrderById,
);
orderRoutes.patch(
  '/:id/status',
  authorize(USER_ROLES.STAFF, USER_ROLES.SUPER_ADMIN),
  validate(orderIdParamSchema, 'params'),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus,
);

export default orderRoutes;
