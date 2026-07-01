import { FilterQuery } from 'mongoose';
import { IProductDocument, Product } from '@modules/product/model/product.model';
import {
  CreateProductDto,
  ProductQueryDto,
  ProductResponseDto,
  UpdateProductDto,
} from '@modules/product/dto/product.dto';
import { buildPaginationMeta } from '@shared/helpers/pagination.helper';

const toProductResponse = (product: IProductDocument): ProductResponseDto => ({
  id: product._id.toString(),
  name: product.name,
  description: product.description,
  price: product.price,
  category: product.category,
  images: product.images,
  videos: product.videos,
  stockQuantity: product.stockQuantity,
  maxOrderLimitPerUser: product.maxOrderLimitPerUser,
  isActive: product.isActive,
  inStock: product.inStock,
  createdBy: product.createdBy.toString(),
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

const buildFilter = (query: ProductQueryDto, staffView: boolean): FilterQuery<IProductDocument> => {
  const filter: FilterQuery<IProductDocument> = {};

  if (!staffView || !query.includeInactive) {
    filter.isActive = true;
  }

  if (staffView && query.isActive !== undefined) {
    filter.isActive = query.isActive;
  }

  if (query.category) {
    filter.category = query.category.toLowerCase();
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) {
      filter.price.$gte = query.minPrice;
    }
    if (query.maxPrice !== undefined) {
      filter.price.$lte = query.maxPrice;
    }
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
};

export const productRepository = {
  async create(data: CreateProductDto, createdBy: string): Promise<IProductDocument> {
    return Product.create({
      ...data,
      category: data.category.toLowerCase(),
      createdBy,
    });
  },

  async findById(id: string): Promise<IProductDocument | null> {
    return Product.findById(id);
  },

  async findAll(
    query: ProductQueryDto,
    staffView: boolean,
  ): Promise<{ items: ProductResponseDto[]; total: number }> {
    const filter = buildFilter(query, staffView);
    const skip = (query.page - 1) * query.limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(query.search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(query.limit),
      Product.countDocuments(filter),
    ]);

    return {
      items: products.map(toProductResponse),
      total,
    };
  },

  async updateById(id: string, data: UpdateProductDto): Promise<IProductDocument | null> {
    const updateData = { ...data };
    if (data.category) {
      updateData.category = data.category.toLowerCase();
    }

    return Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  },

  async deleteById(id: string): Promise<IProductDocument | null> {
    return Product.findByIdAndDelete(id);
  },

  toProductResponse,

  buildPaginationMeta,
};
