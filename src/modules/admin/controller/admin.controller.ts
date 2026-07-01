import { Request, Response } from 'express';
import { sendSuccess } from '@shared/utils/api-response';
import { asyncHandler } from '@shared/utils/async-handler';
import { adminService } from '@modules/admin/service/admin.service';
import { AppError } from '@shared/utils/app-error';
import { HTTP_STATUS } from '@shared/constants';
import {
  AdminOrderListQueryDto,
  AdminProductListQueryDto,
  AdminUserListQueryDto,
  UpdateProductStockDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from '@modules/admin/dto/admin.dto';
import { UpdateOrderStatusDto } from '@modules/order/dto/order.dto';

const getAuthContext = (req: Request) => {
  if (!req.user) {
    throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
  }
  return { userId: req.user.id, role: req.user.role };
};

export const adminController = {
  getUsers: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.getUsers(req.query as unknown as AdminUserListQueryDto);
    sendSuccess(res, 'Users retrieved successfully', result);
  }),

  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.getUserById(req.params.id as string);
    sendSuccess(res, 'User retrieved successfully', { user });
  }),

  updateUserRole: asyncHandler(async (req: Request, res: Response) => {
    const { userId, role } = getAuthContext(req);
    const user = await adminService.updateUserRole(
      req.params.id as string,
      userId,
      role,
      req.body as UpdateUserRoleDto,
    );
    sendSuccess(res, 'User role updated successfully', { user });
  }),

  updateUserStatus: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = getAuthContext(req);
    const user = await adminService.updateUserStatus(
      req.params.id as string,
      userId,
      req.body as UpdateUserStatusDto,
    );
    sendSuccess(res, 'User status updated successfully', { user });
  }),

  getProducts: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.getProducts(req.query as unknown as AdminProductListQueryDto);
    sendSuccess(res, 'Products retrieved successfully', result);
  }),

  activateProduct: asyncHandler(async (req: Request, res: Response) => {
    const product = await adminService.activateProduct(req.params.id as string);
    sendSuccess(res, 'Product activated successfully', { product });
  }),

  deactivateProduct: asyncHandler(async (req: Request, res: Response) => {
    const product = await adminService.deactivateProduct(req.params.id as string);
    sendSuccess(res, 'Product deactivated successfully', { product });
  }),

  updateProductStock: asyncHandler(async (req: Request, res: Response) => {
    const product = await adminService.updateProductStock(
      req.params.id as string,
      req.body as UpdateProductStockDto,
    );
    sendSuccess(res, 'Product stock updated successfully', { product });
  }),

  getOrders: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.getOrders(req.query as unknown as AdminOrderListQueryDto);
    sendSuccess(res, 'Orders retrieved successfully', result);
  }),

  getOrderById: asyncHandler(async (req: Request, res: Response) => {
    const order = await adminService.getOrderById(req.params.id as string);
    sendSuccess(res, 'Order retrieved successfully', { order });
  }),

  updateOrderStatus: asyncHandler(async (req: Request, res: Response) => {
    const order = await adminService.updateOrderStatus(
      req.params.id as string,
      req.body as UpdateOrderStatusDto,
    );
    sendSuccess(res, 'Order status updated successfully', { order });
  }),

  getDashboard: asyncHandler(async (_req: Request, res: Response) => {
    const dashboard = await adminService.getDashboard();
    sendSuccess(res, 'Dashboard data retrieved successfully', { dashboard });
  }),
};
