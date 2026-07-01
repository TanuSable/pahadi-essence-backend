import { ClientSession, FilterQuery, Types } from 'mongoose';
import { Cart, ICartDocument } from '@modules/cart/model/cart.model';
import { Product } from '@modules/product/model/product.model';
import { IOrderDocument, Order } from '@modules/order/model/order.model';
import { OrderListQueryDto } from '@modules/order/dto/order.dto';
import { OrderStatus, PaymentStatus } from '@shared/constants/order.constants';
import { buildPaginationMeta } from '@shared/helpers/pagination.helper';

export interface CreateOrderData {
  userId: string;
  items: {
    productId: Types.ObjectId;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
  }[];
  totalItems: number;
  totalPrice: number;
  shippingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export const orderRepository = {
  async findCartByUserId(userId: string, session?: ClientSession): Promise<ICartDocument | null> {
    const query = Cart.findOne({ userId });
    if (session) query.session(session);
    return query;
  },

  async clearCartByUserId(userId: string, session: ClientSession): Promise<void> {
    await Cart.findOneAndUpdate({ userId }, { items: [] }, { session });
  },

  async deductStock(
    productId: Types.ObjectId,
    quantity: number,
    session: ClientSession,
  ): Promise<boolean> {
    const result = await Product.findOneAndUpdate(
      {
        _id: productId,
        stockQuantity: { $gte: quantity },
        isActive: true,
      },
      { $inc: { stockQuantity: -quantity } },
      { session, new: true },
    );

    return result !== null;
  },

  async restoreStock(
    productId: Types.ObjectId,
    quantity: number,
    session: ClientSession,
  ): Promise<void> {
    await Product.findByIdAndUpdate(productId, { $inc: { stockQuantity: quantity } }, { session });
  },

  async createOrder(data: CreateOrderData, session: ClientSession): Promise<IOrderDocument> {
    const [order] = await Order.create(
      [
        {
          userId: data.userId,
          items: data.items,
          totalItems: data.totalItems,
          totalPrice: data.totalPrice,
          shippingAddress: data.shippingAddress,
        },
      ],
      { session },
    );

    return order;
  },

  async findById(id: string, session?: ClientSession): Promise<IOrderDocument | null> {
    const query = Order.findById(id);
    if (session) query.session(session);
    return query;
  },

  async findByIdAndUserId(id: string, userId: string): Promise<IOrderDocument | null> {
    return Order.findOne({ _id: id, userId });
  },

  async findOrders(
    filter: FilterQuery<IOrderDocument>,
    query: OrderListQueryDto,
  ): Promise<{ orders: IOrderDocument[]; total: number }> {
    const skip = (query.page - 1) * query.limit;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
      Order.countDocuments(filter),
    ]);

    return { orders, total };
  },

  async updateStatus(
    id: string,
    status: OrderStatus,
    paymentStatus: PaymentStatus,
    session?: ClientSession,
  ): Promise<IOrderDocument | null> {
    const query = Order.findByIdAndUpdate(
      id,
      { status, paymentStatus },
      { new: true, runValidators: true },
    );

    if (session) query.session(session);
    return query;
  },

  buildPaginationMeta,
};
