import { PaginationMeta } from '@shared/helpers/pagination.helper';

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
  videos?: string[];
  stockQuantity: number;
  maxOrderLimitPerUser: number;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  images?: string[];
  videos?: string[];
  stockQuantity?: number;
  maxOrderLimitPerUser?: number;
  isActive?: boolean;
}

export interface ProductQueryDto {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  includeInactive?: boolean;
}

export interface ProductResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  videos: string[];
  stockQuantity: number;
  maxOrderLimitPerUser: number;
  isActive: boolean;
  inStock: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedProductsDto {
  items: ProductResponseDto[];
  meta: PaginationMeta;
}
