import { Schema, model, Document, Types } from 'mongoose';

export interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
  priceSnapshot: number;
}

export interface ICart {
  userId: Types.ObjectId;
  items: ICartItem[];
}

export interface ICartDocument extends ICart, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  totalItems: number;
  totalPrice: number;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    priceSnapshot: {
      type: Number,
      required: [true, 'Price snapshot is required'],
      min: [0, 'Price snapshot cannot be negative'],
    },
  },
  { _id: false },
);

const cartSchema = new Schema<ICartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

cartSchema.virtual('totalItems').get(function (this: ICartDocument) {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.virtual('totalPrice').get(function (this: ICartDocument) {
  return this.items.reduce((sum, item) => sum + item.quantity * item.priceSnapshot, 0);
});

cartSchema.index({ userId: 1 }, { unique: true });

export const Cart = model<ICartDocument>('Cart', cartSchema);
