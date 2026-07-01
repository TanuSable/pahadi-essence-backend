import { Request, Response } from 'express';
import { sendSuccess } from '@shared/utils/api-response';
import { asyncHandler } from '@shared/utils/async-handler';
import { orderService } from '@modules/order/service/order.service';
import { AppError } from '@shared/utils/app-error';
import { HTTP_STATUS, UserRole } from '@shared/constants';
import { CheckoutDto, OrderListQueryDto, UpdateOrderStatusDto } from '@modules/order/dto/order.dto';

const getAuthContext = (req: Request): { userId: string; role: UserRole } => {
  if (!req.user) {
    throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
  }
  return { userId: req.user.id, role: req.user.role };
};

export const orderController = {
  checkout: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = getAuthContext(req);
    const order = await orderService.checkout(userId, req.body as CheckoutDto);
    sendSuccess(res, 'Order placed successfully', { order }, HTTP_STATUS.CREATED);
  }),

  getOrders: asyncHandler(async (req: Request, res: Response) => {
    const { userId, role } = getAuthContext(req);
    const result = await orderService.getUserOrders(
      userId,
      role,
      req.query as unknown as OrderListQueryDto,
    );
    sendSuccess(res, 'Orders retrieved successfully', result);
  }),

  getOrderById: asyncHandler(async (req: Request, res: Response) => {
    const { userId, role } = getAuthContext(req);
    const order = await orderService.getOrderById(req.params.id as string, userId, role);
    sendSuccess(res, 'Order retrieved successfully', { order });
  }),

  updateOrderStatus: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.updateOrderStatus(
      req.params.id as string,
      req.body as UpdateOrderStatusDto,
    );
    sendSuccess(res, 'Order status updated successfully', { order });
  }),
};
