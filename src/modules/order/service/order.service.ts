import mongoose from 'mongoose';
import { IProductDocument, Product } from '@modules/product/model/product.model';
import { ICartDocument } from '@modules/cart/model/cart.model';
import { IOrderDocument } from '@modules/order/model/order.model';
import { orderRepository } from '@modules/order/repository/order.repository';
import {
  CheckoutDto,
  OrderListQueryDto,
  OrderResponseDto,
  PaginatedOrdersDto,
  UpdateOrderStatusDto,
} from '@modules/order/dto/order.dto';
import { AppError } from '@shared/utils/app-error';
import { HTTP_STATUS, USER_ROLES, UserRole } from '@shared/constants';
import {
  ORDER_STATUS,
  ORDER_STATUS_TRANSITIONS,
  OrderStatus,
  resolvePaymentStatus,
} from '@shared/constants/order.constants';

const isStaffOrAdmin = (role?: UserRole): boolean => {
  return role === USER_ROLES.STAFF || role === USER_ROLES.SUPER_ADMIN;
};

const toOrderResponse = (order: IOrderDocument): OrderResponseDto => ({
  id: order._id.toString(),
  userId: order.userId.toString(),
  items: order.items.map((item) => ({
    productId: item.productId.toString(),
    nameSnapshot: item.nameSnapshot,
    priceSnapshot: item.priceSnapshot,
    quantity: item.quantity,
    lineTotal: item.quantity * item.priceSnapshot,
  })),
  totalItems: order.totalItems,
  totalPrice: order.totalPrice,
  status: order.status,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  shippingAddress: order.shippingAddress,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const validateProductForCheckout = (
  product: IProductDocument | null,
  quantity: number,
): IProductDocument => {
  if (!product) {
    throw new AppError('Product is no longer available', HTTP_STATUS.BAD_REQUEST);
  }

  if (!product.isActive) {
    throw new AppError(`${product.name} is not available`, HTTP_STATUS.BAD_REQUEST);
  }

  if (product.stockQuantity < quantity) {
    throw new AppError(`Insufficient stock for ${product.name}`, HTTP_STATUS.BAD_REQUEST);
  }

  if (quantity > product.maxOrderLimitPerUser) {
    throw new AppError(
      `Quantity for ${product.name} exceeds max order limit of ${product.maxOrderLimitPerUser}`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return product;
};

const validateCartNotEmpty = (cart: ICartDocument | null): ICartDocument => {
  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', HTTP_STATUS.BAD_REQUEST);
  }
  return cart;
};

const validateStatusTransition = (currentStatus: OrderStatus, newStatus: OrderStatus): void => {
  const allowed = ORDER_STATUS_TRANSITIONS[currentStatus];

  if (!allowed.includes(newStatus)) {
    throw new AppError(
      `Cannot transition order from ${currentStatus} to ${newStatus}`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

export const orderService = {
  async checkout(userId: string, data: CheckoutDto): Promise<OrderResponseDto> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const cart = validateCartNotEmpty(await orderRepository.findCartByUserId(userId, session));

      const orderItems: {
        productId: mongoose.Types.ObjectId;
        nameSnapshot: string;
        priceSnapshot: number;
        quantity: number;
      }[] = [];

      let totalItems = 0;
      let totalPrice = 0;

      for (const cartItem of cart.items) {
        const product = await Product.findById(cartItem.productId).session(session);
        const validatedProduct = validateProductForCheckout(product, cartItem.quantity);

        const lineTotal = cartItem.quantity * cartItem.priceSnapshot;

        orderItems.push({
          productId: validatedProduct._id,
          nameSnapshot: validatedProduct.name,
          priceSnapshot: cartItem.priceSnapshot,
          quantity: cartItem.quantity,
        });

        totalItems += cartItem.quantity;
        totalPrice += lineTotal;
      }

      const order = await orderRepository.createOrder(
        {
          userId,
          items: orderItems,
          totalItems,
          totalPrice,
          shippingAddress: data.shippingAddress,
        },
        session,
      );

      for (const item of orderItems) {
        const deducted = await orderRepository.deductStock(item.productId, item.quantity, session);

        if (!deducted) {
          throw new AppError(
            `Insufficient stock for ${item.nameSnapshot}`,
            HTTP_STATUS.BAD_REQUEST,
          );
        }
      }

      await orderRepository.clearCartByUserId(userId, session);

      await session.commitTransaction();
      return toOrderResponse(order);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async getUserOrders(
    userId: string,
    role: UserRole | undefined,
    query: OrderListQueryDto,
  ): Promise<PaginatedOrdersDto> {
    const filter: Record<string, unknown> = isStaffOrAdmin(role) ? {} : { userId };

    if (query.status) {
      filter.status = query.status;
    }

    const { orders, total } = await orderRepository.findOrders(filter, query);

    return {
      items: orders.map(toOrderResponse),
      meta: orderRepository.buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getOrderById(
    orderId: string,
    userId: string,
    role: UserRole | undefined,
  ): Promise<OrderResponseDto> {
    const order = isStaffOrAdmin(role)
      ? await orderRepository.findById(orderId)
      : await orderRepository.findByIdAndUserId(orderId, userId);

    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    return toOrderResponse(order);
  },

  async updateOrderStatus(orderId: string, data: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await orderRepository.findById(orderId, session);

      if (!order) {
        throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
      }

      validateStatusTransition(order.status, data.status);

      if (data.status === ORDER_STATUS.CANCELLED) {
        for (const item of order.items) {
          await orderRepository.restoreStock(item.productId, item.quantity, session);
        }
      }

      const paymentStatus = resolvePaymentStatus(data.status);

      const updatedOrder = await orderRepository.updateStatus(
        orderId,
        data.status,
        paymentStatus,
        session,
      );

      if (!updatedOrder) {
        throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
      }

      await session.commitTransaction();
      return toOrderResponse(updatedOrder);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async getAdminOrders(query: OrderListQueryDto): Promise<
    PaginatedOrdersDto & {
      analytics: {
        totalOrders: number;
        totalRevenue: number;
        statusDistribution: Record<string, number>;
      };
    }
  > {
    const filter: Record<string, unknown> = {};

    if (query.status) {
      filter.status = query.status;
    }

    const [{ orders, total }, analytics] = await Promise.all([
      orderRepository.findOrders(filter, query),
      orderRepository.getAnalytics(),
    ]);

    return {
      items: orders.map(toOrderResponse),
      meta: orderRepository.buildPaginationMeta(query.page, query.limit, total),
      analytics,
    };
  },

  async getAdminOrderById(orderId: string): Promise<OrderResponseDto> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    return toOrderResponse(order);
  },

  toOrderResponse,
};
