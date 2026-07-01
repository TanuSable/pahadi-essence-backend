import { Types } from 'mongoose';
import { Cart, ICartDocument } from '@modules/cart/model/cart.model';
import { IProductDocument } from '@modules/product/model/product.model';

const PRODUCT_POPULATE_FIELDS = 'name price images stockQuantity maxOrderLimitPerUser isActive';

export const cartRepository = {
  async findByUserId(userId: string): Promise<ICartDocument | null> {
    return Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: PRODUCT_POPULATE_FIELDS,
    });
  },

  async findOrCreateByUserId(userId: string): Promise<ICartDocument> {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    return cart;
  },

  async save(cart: ICartDocument): Promise<ICartDocument> {
    await cart.save();
    return cart.populate({
      path: 'items.productId',
      select: PRODUCT_POPULATE_FIELDS,
    });
  },

  async clearByUserId(userId: string): Promise<ICartDocument | null> {
    return Cart.findOneAndUpdate({ userId }, { items: [] }, { new: true }).populate({
      path: 'items.productId',
      select: PRODUCT_POPULATE_FIELDS,
    });
  },

  findItemIndex(cart: ICartDocument, productId: string): number {
    return cart.items.findIndex((item) => item.productId.toString() === productId);
  },

  toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  },

  isProductDocument(value: unknown): value is IProductDocument {
    return (
      typeof value === 'object' &&
      value !== null &&
      '_id' in value &&
      'name' in value &&
      'price' in value
    );
  },
};
