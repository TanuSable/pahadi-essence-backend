import { Schema, model, Document, Types } from 'mongoose';

export interface IProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  videos: string[];
  stockQuantity: number;
  maxOrderLimitPerUser: number;
  isActive: boolean;
  createdBy: Types.ObjectId;
}

export interface IProductDocument extends IProduct, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  inStock: boolean;
}

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
    },
    images: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
    maxOrderLimitPerUser: {
      type: Number,
      required: [true, 'Max order limit per user is required'],
      min: [1, 'Max order limit per user must be at least 1'],
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.virtual('inStock').get(function (this: IProductDocument) {
  return this.stockQuantity > 0;
});

productSchema.index({ name: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });

export const Product = model<IProductDocument>('Product', productSchema);
