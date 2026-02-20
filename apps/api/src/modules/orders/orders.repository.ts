import { Prisma, PrismaClient } from '@prisma/client';

export class OrdersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  getCart(tenantId: string, userId: string, storeId: string) {
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
          }
        }
      }
    });
  }

  async createOrderWithReservations(input: {
    tenantId: string;
    storeId: string;
    userId: string;
    idempotencyKey: string;
    subtotal: number;
    tax: number;
    totalAmount: number;
    orderNumber: string;
    shippingAddress: {
      name: string;
      phone: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    cartItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      title: string;
      size?: string;
      color?: string;
      customization?: unknown;
    }>;
  }) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of input.cartItems) {
        const product = await tx.product.findFirst({
          where: {
            tenantId: input.tenantId,
            id: item.productId,
            isActive: true
          }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock - product.reservedStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.title}`);
        }
      }

      const address = await tx.address.create({
        data: {
          tenantId: input.tenantId,
          userId: input.userId,
          ...input.shippingAddress,
          isDefault: false
        }
      });

      const order = await tx.order.create({
        data: {
          tenantId: input.tenantId,
          storeId: input.storeId,
          userId: input.userId,
          shippingAddressId: address.id,
          orderNumber: input.orderNumber,
          status: 'PAYMENT_PENDING',
          paymentStatus: 'PENDING',
          subtotal: input.subtotal,
          tax: input.tax,
          totalAmount: input.totalAmount,
          idempotencyKey: input.idempotencyKey
        }
      });

      await tx.orderItem.createMany({
        data: input.cartItems.map((item) => ({
          tenantId: input.tenantId,
          orderId: order.id,
          productId: item.productId,
          title: item.title,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          size: item.size ?? null,
          color: item.color ?? null,
          customization: (item.customization as any) ?? Prisma.DbNull
        }))
      });

      const expiry = new Date(Date.now() + 15 * 60 * 1000);

      for (const item of input.cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            reservedStock: {
              increment: item.quantity
            }
          }
        });

        await tx.stockReservation.create({
          data: {
            tenantId: input.tenantId,
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            expiresAt: expiry
          }
        });
      }

      return order;
    });
  }

  updateOrderPaymentIntent(tenantId: string, orderId: string, stripePaymentIntentId: string) {
    return this.prisma.order.updateMany({
      where: {
        tenantId,
        id: orderId
      },
      data: {
        stripePaymentIntentId
      }
    });
  }

  findById(tenantId: string, id: string) {
    return this.prisma.order.findFirst({
      where: {
        tenantId,
        id
      },
      include: {
        items: true,
        shippingAddress: true
      }
    });
  }

  findByIdGlobal(id: string) {
    return this.prisma.order.findUnique({
      where: {
        id
      },
      include: {
        items: true,
        shippingAddress: true
      }
    });
  }

  listByUser(tenantId: string, userId: string, page: number, limit: number) {
    return this.prisma.order.findMany({
      where: {
        tenantId,
        userId
      },
      orderBy: {
        placedAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: true
      }
    });
  }

  listAll(tenantId: string, page: number, limit: number) {
    return this.prisma.order.findMany({
      where: {
        tenantId
      },
      orderBy: {
        placedAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            displayName: true
          }
        }
      }
    });
  }

  findByPaymentIntent(paymentIntentId: string) {
    return this.prisma.order.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId
      },
      include: {
        reservations: true,
        items: true
      }
    });
  }

  async markPaymentSuccess(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          reservations: true,
          items: true
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.paymentStatus === 'SUCCEEDED') {
        return order;
      }

      for (const reservation of order.reservations) {
        await tx.product.update({
          where: { id: reservation.productId },
          data: {
            reservedStock: {
              decrement: reservation.quantity
            },
            stock: {
              decrement: reservation.quantity
            }
          }
        });
      }

      await tx.stockReservation.updateMany({
        where: {
          orderId
        },
        data: {
          releasedAt: new Date()
        }
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'SUCCEEDED',
          status: 'PROCESSING'
        }
      });

      await tx.cartItem.deleteMany({
        where: {
          tenantId: order.tenantId,
          cart: {
            userId: order.userId,
            storeId: order.storeId
          }
        }
      });

      return order;
    });
  }

  async markPaymentFailed(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          reservations: true
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.paymentStatus === 'FAILED') {
        return order;
      }

      for (const reservation of order.reservations) {
        await tx.product.update({
          where: { id: reservation.productId },
          data: {
            reservedStock: {
              decrement: reservation.quantity
            }
          }
        });
      }

      await tx.stockReservation.updateMany({
        where: {
          orderId
        },
        data: {
          releasedAt: new Date()
        }
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          status: 'PAYMENT_FAILED'
        }
      });

      return order;
    });
  }

  findIdempotency(tenantId: string, endpoint: string, key: string) {
    return this.prisma.idempotencyKey.findUnique({
      where: {
        tenantId_endpoint_idempotencyKey: {
          tenantId,
          endpoint,
          idempotencyKey: key
        }
      }
    });
  }

  saveIdempotency(input: {
    tenantId: string;
    endpoint: string;
    idempotencyKey: string;
    requestHash: string;
    responseCode: number;
    responseBody: Record<string, unknown>;
  }) {
    return this.prisma.idempotencyKey.create({
      data: input as any
    });
  }

  updateStatus(tenantId: string, id: string, status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') {
    return this.prisma.order.updateMany({
      where: {
        tenantId,
        id
      },
      data: {
        status
      }
    });
  }
}
