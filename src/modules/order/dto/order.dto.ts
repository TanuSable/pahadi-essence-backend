import { OrderStatus, PaymentMethod, PaymentStatus } from '@shared/constants/order.constants';
import { PaginationMeta } from '@shared/helpers/pagination.helper';

export interface ShippingAddressDto {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CheckoutDto {
  shippingAddress?: ShippingAddressDto;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface OrderListQueryDto {
  page: number;
  limit: number;
  status?: OrderStatus;
}

export interface OrderItemResponseDto {
  productId: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderResponseDto {
  id: string;
  userId: string;
  items: OrderItemResponseDto[];
  totalItems: number;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress?: ShippingAddressDto;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedOrdersDto {
  items: OrderResponseDto[];
  meta: PaginationMeta;
}
