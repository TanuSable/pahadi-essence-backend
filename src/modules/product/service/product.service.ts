import { Request } from 'express';
import { productRepository } from '@modules/product/repository/product.repository';
import { uploadService } from '@modules/product/service/upload.service';
import {
  CreateProductDto,
  PaginatedProductsDto,
  ProductQueryDto,
  ProductResponseDto,
  UpdateProductDto,
} from '@modules/product/dto/product.dto';
import { AppError } from '@shared/utils/app-error';
import { HTTP_STATUS, USER_ROLES } from '@shared/constants';
import { getUploadedFiles } from '@modules/product/middleware/upload.middleware';

const isStaffOrAdmin = (role?: string): boolean => {
  return role === USER_ROLES.STAFF || role === USER_ROLES.SUPER_ADMIN;
};

const validateStockQuantity = (stockQuantity?: number): void => {
  if (stockQuantity !== undefined && stockQuantity < 0) {
    throw new AppError('Stock quantity cannot be negative', HTTP_STATUS.BAD_REQUEST);
  }
};

const validatePriceRange = (minPrice?: number, maxPrice?: number): void => {
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new AppError('minPrice cannot be greater than maxPrice', HTTP_STATUS.BAD_REQUEST);
  }
};

const resolveMediaUrls = async (
  req: Request,
  existingImages: string[] = [],
  existingVideos: string[] = [],
): Promise<{ images: string[]; videos: string[] }> => {
  const { images: imageFiles, videos: videoFiles } = getUploadedFiles(req);

  try {
    const [uploadedImages, uploadedVideos] = await Promise.all([
      imageFiles.length > 0 ? uploadService.uploadImages(imageFiles) : Promise.resolve([]),
      videoFiles.length > 0 ? uploadService.uploadVideos(videoFiles) : Promise.resolve([]),
    ]);

    return {
      images: [...existingImages, ...uploadedImages],
      videos: [...existingVideos, ...uploadedVideos],
    };
  } catch (error) {
    return uploadService.handleUploadError(error);
  }
};

export const productService = {
  async createProduct(req: Request, data: CreateProductDto): Promise<ProductResponseDto> {
    if (!req.user) {
      throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    }

    validateStockQuantity(data.stockQuantity);

    const bodyImages = data.images ?? [];
    const bodyVideos = data.videos ?? [];
    const { images, videos } = await resolveMediaUrls(req, bodyImages, bodyVideos);

    const product = await productRepository.create(
      {
        ...data,
        images,
        videos,
      },
      req.user.id,
    );

    return productRepository.toProductResponse(product);
  },

  async getProducts(req: Request, query: ProductQueryDto): Promise<PaginatedProductsDto> {
    validatePriceRange(query.minPrice, query.maxPrice);

    const staffView = isStaffOrAdmin(req.user?.role);
    const { items, total } = await productRepository.findAll(query, staffView);

    return {
      items,
      meta: productRepository.buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getProductById(req: Request, id: string): Promise<ProductResponseDto> {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    const staffView = isStaffOrAdmin(req.user?.role);
    if (!staffView && !product.isActive) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    return productRepository.toProductResponse(product);
  },

  async updateProduct(
    req: Request,
    id: string,
    data: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    if (!req.user) {
      throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    }

    validateStockQuantity(data.stockQuantity);

    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    const { images: imageFiles, videos: videoFiles } = getUploadedFiles(req);
    const hasFieldUpdates = Object.keys(data).length > 0;
    const hasMediaUploads = imageFiles.length > 0 || videoFiles.length > 0;

    if (!hasFieldUpdates && !hasMediaUploads) {
      throw new AppError(
        'At least one field or media file must be provided for update',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const bodyImages = data.images ?? existing.images;
    const bodyVideos = data.videos ?? existing.videos;
    const { images, videos } = await resolveMediaUrls(req, bodyImages, bodyVideos);

    const updated = await productRepository.updateById(id, {
      ...data,
      images,
      videos,
    });

    if (!updated) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    return productRepository.toProductResponse(updated);
  },

  async deleteProduct(id: string): Promise<void> {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    await uploadService.deleteMedia([...product.images, ...product.videos]);
    await productRepository.deleteById(id);
  },
};
