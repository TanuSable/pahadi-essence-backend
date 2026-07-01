import { Product, IProductDocument } from '@modules/product/model/product.model';
import { cartRepository } from '@modules/cart/repository/cart.repository';
import { ICartDocument } from '@modules/cart/model/cart.model';
import {
  AddToCartDto,
  CartItemResponseDto,
  CartProductDto,
  CartResponseDto,
  UpdateCartItemDto,
} from '@modules/cart/dto/cart.dto';
import { AppError } from '@shared/utils/app-error';
import { HTTP_STATUS } from '@shared/constants';

const getMaxAllowedQuantity = (product: IProductDocument): number => {
  return Math.min(product.stockQuantity, product.maxOrderLimitPerUser);
};

const validateProductForCart = (product: IProductDocument | null): IProductDocument => {
  if (!product) {
    throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
  }

  if (!product.isActive) {
    throw new AppError('Product is not available', HTTP_STATUS.BAD_REQUEST);
  }

  if (product.stockQuantity <= 0) {
    throw new AppError('Product is out of stock', HTTP_STATUS.BAD_REQUEST);
  }

  return product;
};

const validateQuantityLimits = (product: IProductDocument, quantity: number): void => {
  const maxAllowed = getMaxAllowedQuantity(product);

  if (quantity > maxAllowed) {
    throw new AppError(
      `Quantity cannot exceed ${maxAllowed} (limited by stock or max order limit per user)`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

const toCartProductDto = (product: IProductDocument): CartProductDto => ({
  id: product._id.toString(),
  name: product.name,
  price: product.price,
  images: product.images,
  stockQuantity: product.stockQuantity,
  maxOrderLimitPerUser: product.maxOrderLimitPerUser,
  isActive: product.isActive,
  inStock: product.stockQuantity > 0,
});

const toCartResponse = (cart: ICartDocument): CartResponseDto => {
  const items: CartItemResponseDto[] = cart.items
    .map((item) => {
      const populated = item.productId;

      if (!cartRepository.isProductDocument(populated)) {
        return null;
      }

      return {
        productId: populated._id.toString(),
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot,
        lineTotal: item.quantity * item.priceSnapshot,
        product: toCartProductDto(populated),
      };
    })
    .filter((item): item is CartItemResponseDto => item !== null);

  return {
    id: cart._id.toString(),
    userId: cart.userId.toString(),
    items,
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};

export const cartService = {
  async getCart(userId: string): Promise<CartResponseDto> {
    let cart = await cartRepository.findByUserId(userId);

    if (!cart) {
      cart = await cartRepository.findOrCreateByUserId(userId);
      cart = await cartRepository.save(cart);
    }

    return toCartResponse(cart);
  },

  async addToCart(userId: string, data: AddToCartDto): Promise<CartResponseDto> {
    const product = validateProductForCart(await Product.findById(data.productId));
    const cart = await cartRepository.findOrCreateByUserId(userId);
    const itemIndex = cartRepository.findItemIndex(cart, data.productId);

    const newQuantity =
      itemIndex === -1 ? data.quantity : cart.items[itemIndex].quantity + data.quantity;

    validateQuantityLimits(product, newQuantity);

    if (itemIndex === -1) {
      cart.items.push({
        productId: cartRepository.toObjectId(data.productId),
        quantity: data.quantity,
        priceSnapshot: product.price,
      });
    } else {
      cart.items[itemIndex].quantity = newQuantity;
      cart.items[itemIndex].priceSnapshot = product.price;
    }

    const savedCart = await cartRepository.save(cart);
    return toCartResponse(savedCart);
  },

  async updateCartItem(userId: string, data: UpdateCartItemDto): Promise<CartResponseDto> {
    const product = validateProductForCart(await Product.findById(data.productId));
    validateQuantityLimits(product, data.quantity);

    const cart = await cartRepository.findByUserId(userId);

    if (!cart) {
      throw new AppError('Cart not found', HTTP_STATUS.NOT_FOUND);
    }

    const itemIndex = cartRepository.findItemIndex(cart, data.productId);

    if (itemIndex === -1) {
      throw new AppError('Product not found in cart', HTTP_STATUS.NOT_FOUND);
    }

    cart.items[itemIndex].quantity = data.quantity;
    cart.items[itemIndex].priceSnapshot = product.price;

    const savedCart = await cartRepository.save(cart);
    return toCartResponse(savedCart);
  },

  async removeFromCart(userId: string, productId: string): Promise<CartResponseDto> {
    const cart = await cartRepository.findByUserId(userId);

    if (!cart) {
      throw new AppError('Cart not found', HTTP_STATUS.NOT_FOUND);
    }

    const itemIndex = cartRepository.findItemIndex(cart, productId);

    if (itemIndex === -1) {
      throw new AppError('Product not found in cart', HTTP_STATUS.NOT_FOUND);
    }

    cart.items.splice(itemIndex, 1);

    const savedCart = await cartRepository.save(cart);
    return toCartResponse(savedCart);
  },

  async clearCart(userId: string): Promise<CartResponseDto> {
    const cart = await cartRepository.clearByUserId(userId);

    if (!cart) {
      const newCart = await cartRepository.findOrCreateByUserId(userId);
      return toCartResponse(newCart);
    }

    return toCartResponse(cart);
  },
};
