import { AppError } from '../../shared/errors.js';
import { CartsRepository } from './carts.repository.js';

export class CartsService {
  constructor(private readonly repository: CartsRepository) {}

  async getCart(tenantId: string, userId: string, storeId: string) {
    await this.repository.getOrCreateCart(tenantId, userId, storeId);
    const cart = await this.repository.getCartWithItems(tenantId, userId, storeId);
    if (!cart) {
      throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');
    }

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

    return {
      ...cart,
      subtotal,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  async addItem(input: {
    tenantId: string;
    userId: string;
    storeId: string;
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
    customization?: Record<string, unknown>;
  }) {
    const product = await this.repository.getProduct(input.tenantId, input.productId);
    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.stock - product.reservedStock < input.quantity) {
      throw new AppError('Insufficient stock', 409, 'INSUFFICIENT_STOCK');
    }

    const cart = await this.repository.getOrCreateCart(input.tenantId, input.userId, input.storeId);

    await this.repository.addItem({
      tenantId: input.tenantId,
      cartId: cart.id,
      productId: input.productId,
      quantity: input.quantity,
      unitPrice: Number(product.basePrice),
      size: input.size,
      color: input.color,
      customization: input.customization
    });

    return this.getCart(input.tenantId, input.userId, input.storeId);
  }

  async updateItem(tenantId: string, itemId: string, quantity: number) {
    const item = await this.repository.findItemById(tenantId, itemId);
    if (!item) {
      throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
    }

    await this.repository.updateItem(tenantId, itemId, quantity);
    return { updated: true };
  }

  async removeItem(tenantId: string, itemId: string) {
    const result = await this.repository.removeItem(tenantId, itemId);
    if (result.count === 0) {
      throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
    }
    return { removed: true };
  }

  async clearCart(tenantId: string, userId: string, storeId: string) {
    const cart = await this.repository.getOrCreateCart(tenantId, userId, storeId);
    await this.repository.clearCart(tenantId, cart.id);
    return { cleared: true };
  }
}
