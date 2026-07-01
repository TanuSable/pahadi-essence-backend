import { adminRepository } from '@modules/admin/repository/admin.repository';
import { productService } from '@modules/product/service/product.service';
import { orderService } from '@modules/order/service/order.service';
import type {
  AdminOrderListQueryDto,
  AdminProductListQueryDto,
  AdminUserListQueryDto,
  AdminUserResponseDto,
  DashboardResponseDto,
  PaginatedAdminProductsDto,
  PaginatedAdminUsersDto,
  UpdateProductStockDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from '@modules/admin/dto/admin.dto';
import type { OrderResponseDto, UpdateOrderStatusDto } from '@modules/order/dto/order.dto';
import type { ProductResponseDto } from '@modules/product/dto/product.dto';
import { AppError } from '@shared/utils/app-error';
import { HTTP_STATUS, USER_ROLES, UserRole } from '@shared/constants';

export const adminService = {
  async getUsers(query: AdminUserListQueryDto): Promise<PaginatedAdminUsersDto> {
    const { users, total } = await adminRepository.findUsers(query);

    return {
      items: users,
      meta: adminRepository.buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getUserById(userId: string): Promise<AdminUserResponseDto> {
    const user = await adminRepository.findUserById(userId);

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    return user;
  },

  async updateUserRole(
    targetUserId: string,
    actorUserId: string,
    actorRole: UserRole,
    data: UpdateUserRoleDto,
  ): Promise<AdminUserResponseDto> {
    if (actorRole !== USER_ROLES.SUPER_ADMIN) {
      throw new AppError('Only super admins can change user roles', HTTP_STATUS.FORBIDDEN);
    }

    if (targetUserId === actorUserId) {
      throw new AppError('You cannot change your own role', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await adminRepository.updateUserRole(targetUserId, data.role);

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    return user;
  },

  async updateUserStatus(
    targetUserId: string,
    actorUserId: string,
    data: UpdateUserStatusDto,
  ): Promise<AdminUserResponseDto> {
    if (targetUserId === actorUserId) {
      throw new AppError('You cannot change your own account status', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await adminRepository.updateUserStatus(targetUserId, data.isActive);

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    return user;
  },

  async getProducts(query: AdminProductListQueryDto): Promise<PaginatedAdminProductsDto> {
    return productService.getAdminProducts({
      page: query.page,
      limit: query.limit,
      search: query.search,
      category: query.category,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      isActive: query.isActive,
      includeInactive: true,
    });
  },

  async activateProduct(productId: string): Promise<ProductResponseDto> {
    return productService.setProductActive(productId, true);
  },

  async deactivateProduct(productId: string): Promise<ProductResponseDto> {
    return productService.setProductActive(productId, false);
  },

  async updateProductStock(
    productId: string,
    data: UpdateProductStockDto,
  ): Promise<ProductResponseDto> {
    return productService.updateProductStock(productId, data.stockQuantity);
  },

  async getOrders(query: AdminOrderListQueryDto) {
    return orderService.getAdminOrders(query);
  },

  async getOrderById(orderId: string): Promise<OrderResponseDto> {
    return orderService.getAdminOrderById(orderId);
  },

  async updateOrderStatus(orderId: string, data: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    return orderService.updateOrderStatus(orderId, data);
  },

  async getDashboard(): Promise<DashboardResponseDto> {
    const [totalUsers, totalProducts, totalOrders, totalRevenue, orderStatusBreakdown, recentOrders] =
      await Promise.all([
        adminRepository.countUsers(),
        adminRepository.countProducts(),
        adminRepository.countOrders(),
        adminRepository.getTotalRevenue(),
        adminRepository.getOrderStatusBreakdown(),
        orderService.getAdminOrders({ page: 1, limit: 10 }),
      ]);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders: recentOrders.items,
      orderStatusBreakdown,
    };
  },
};
