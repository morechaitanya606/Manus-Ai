import { PrismaClient } from '@prisma/client';

export class CartsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getOrCreateCart(tenantId: string, userId: string, storeId: string) {
    const existing = await this.prisma.cart.findUnique({
      where: {
        tenantId_userId_storeId: {
          tenantId,
          userId,
          storeId
        }
      }
    });

    if (existing) {
      return existing;
    }

    return this.prisma.cart.create({
      data: {
        tenantId,
        userId,
        storeId
      }
    });
  }

  getCartWithItems(tenantId: string, userId: string, storeId: string) {
    return this.prisma.cart.findUnique({
      where: {
        tenantId_userId_storeId: {
          tenantId,
          userId,
          storeId
        }
      },
      include: {
        items: {
          include: {
            product: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
  }

  getProduct(tenantId: string, productId: string) {
    return this.prisma.product.findFirst({
      where: {
        tenantId,
        id: productId,
        isActive: true
      }
    });
  }

  addItem(input: {
    tenantId: string;
    cartId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    size?: string;
    color?: string;
    customization?: Record<string, unknown>;
  }) {
    return this.prisma.cartItem.create({
      data: {
        tenantId: input.tenantId,
        cartId: input.cartId,
        productId: input.productId,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
        size: input.size,
        color: input.color,
        customization: input.customization
      } as any
    });
  }

  updateItem(tenantId: string, itemId: string, quantity: number) {
    return this.prisma.cartItem.updateMany({
      where: {
        tenantId,
        id: itemId
      },
      data: {
        quantity
      }
    });
  }

  removeItem(tenantId: string, itemId: string) {
    return this.prisma.cartItem.deleteMany({
      where: {
        tenantId,
        id: itemId
      }
    });
  }

  clearCart(tenantId: string, cartId: string) {
    return this.prisma.cartItem.deleteMany({
      where: {
        tenantId,
        cartId
      }
    });
  }

  findItemById(tenantId: string, itemId: string) {
    return this.prisma.cartItem.findFirst({
      where: {
        tenantId,
        id: itemId
      }
    });
  }
}
