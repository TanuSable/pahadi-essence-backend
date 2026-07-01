import { Request, Response } from 'express';
import { sendSuccess } from '@shared/utils/api-response';
import { asyncHandler } from '@shared/utils/async-handler';
import { cartService } from '@modules/cart/service/cart.service';
import { AppError } from '@shared/utils/app-error';
import { HTTP_STATUS } from '@shared/constants';
import { AddToCartDto, UpdateCartItemDto } from '@modules/cart/dto/cart.dto';

const getUserId = (req: Request): string => {
  if (!req.user) {
    throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
  }
  return req.user.id;
};

export const cartController = {
  addToCart: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.addToCart(getUserId(req), req.body as AddToCartDto);
    sendSuccess(res, 'Product added to cart', { cart });
  }),

  getCart: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.getCart(getUserId(req));
    sendSuccess(res, 'Cart retrieved successfully', { cart });
  }),

  updateCartItem: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.updateCartItem(getUserId(req), req.body as UpdateCartItemDto);
    sendSuccess(res, 'Cart updated successfully', { cart });
  }),

  removeFromCart: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.removeFromCart(getUserId(req), req.params.id as string);
    sendSuccess(res, 'Product removed from cart', { cart });
  }),

  clearCart: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.clearCart(getUserId(req));
    sendSuccess(res, 'Cart cleared successfully', { cart });
  }),
};
