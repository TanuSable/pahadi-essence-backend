import { UserRole } from '@shared/constants';
import { OrderStatus } from '@shared/constants/order.constants';
import { PaginationMeta } from '@shared/helpers/pagination.helper';
import { OrderResponseDto } from '@modules/order/dto/order.dto';
import { ProductResponseDto } from '@modules/product/dto/product.dto';

export interface AdminUserListQueryDto {
  page: number;
  limit: number;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

export interface AdminUserResponseDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedAdminUsersDto {
  items: AdminUserResponseDto[];
  meta: PaginationMeta;
}

export interface UpdateUserRoleDto {
  role: UserRole;
}

export interface UpdateUserStatusDto {
  isActive: boolean;
}

export interface UpdateProductStockDto {
  stockQuantity: number;
}

export interface OrderAnalyticsDto {
  totalOrders: number;
  totalRevenue: number;
  statusDistribution: Record<string, number>;
}

export interface AdminOrdersResponseDto {
  items: OrderResponseDto[];
  meta: PaginationMeta;
  analytics: OrderAnalyticsDto;
}

export interface DashboardResponseDto {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: OrderResponseDto[];
  orderStatusBreakdown: Record<string, number>;
}

export interface AdminProductListQueryDto {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

export interface PaginatedAdminProductsDto {
  items: ProductResponseDto[];
  meta: PaginationMeta;
}

export interface AdminOrderListQueryDto {
  page: number;
  limit: number;
  status?: OrderStatus;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}
