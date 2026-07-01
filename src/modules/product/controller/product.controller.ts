import { Request, Response } from 'express';
import { sendSuccess } from '@shared/utils/api-response';
import { asyncHandler } from '@shared/utils/async-handler';
import { productService } from '@modules/product/service/product.service';
import { HTTP_STATUS } from '@shared/constants';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from '@modules/product/dto/product.dto';

export const productController = {
  createProduct: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.createProduct(req, req.body as CreateProductDto);
    sendSuccess(res, 'Product created successfully', { product }, HTTP_STATUS.CREATED);
  }),

  getProducts: asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.getProducts(req, req.query as unknown as ProductQueryDto);
    sendSuccess(res, 'Products retrieved successfully', result);
  }),

  getProductById: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProductById(req, req.params.id as string);
    sendSuccess(res, 'Product retrieved successfully', { product });
  }),

  updateProduct: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.updateProduct(
      req,
      req.params.id as string,
      req.body as UpdateProductDto,
    );
    sendSuccess(res, 'Product updated successfully', { product });
  }),

  deleteProduct: asyncHandler(async (req: Request, res: Response) => {
    await productService.deleteProduct(req.params.id as string);
    sendSuccess(res, 'Product deleted successfully', null);
  }),
};
