export interface AddToCartDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  productId: string;
  quantity: number;
}

export interface CartProductDto {
  id: string;
  name: string;
  price: number;
  images: string[];
  stockQuantity: number;
  maxOrderLimitPerUser: number;
  isActive: boolean;
  inStock: boolean;
}

export interface CartItemResponseDto {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  lineTotal: number;
  product: CartProductDto;
}

export interface CartResponseDto {
  id: string;
  userId: string;
  items: CartItemResponseDto[];
  totalItems: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
