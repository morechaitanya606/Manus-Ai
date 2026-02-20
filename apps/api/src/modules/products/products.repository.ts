import { Prisma, PrismaClient } from '@prisma/client';

export class ProductsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listProducts(tenantId: string, query: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    size?: string;
    sort: 'newest' | 'price_asc' | 'price_desc';
  }) {
    const where: Prisma.ProductWhereInput = {
      tenantId,
      isActive: true
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.minPrice || query.maxPrice) {
      where.basePrice = {
        ...(typeof query.minPrice === 'number' ? { gte: query.minPrice } : {}),
        ...(typeof query.maxPrice === 'number' ? { lte: query.maxPrice } : {})
      };
    }

    if (query.color) {
      where.colors = {
        has: query.color
      };
    }

    if (query.size) {
      where.sizes = {
        has: query.size
      };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === 'price_asc'
        ? { basePrice: 'asc' }
        : query.sort === 'price_desc'
          ? { basePrice: 'desc' }
          : { createdAt: 'desc' };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          type: true,
          basePrice: true,
          currency: true,
          stock: true,
          reservedStock: true,
          sizes: true,
          colors: true,
          images: true,
          metadata: true,
          createdAt: true
        }
      })
    ]);

    return { total, data };
  }

  getProductById(tenantId: string, id: string) {
    return this.prisma.product.findFirst({
      where: {
        tenantId,
        id,
        isActive: true
      }
    });
  }

  createProduct(tenantId: string, input: Prisma.ProductUncheckedCreateInput) {
    return this.prisma.product.create({
      data: {
        ...input,
        tenantId
      }
    });
  }

  updateProduct(tenantId: string, id: string, input: Prisma.ProductUncheckedUpdateInput) {
    return this.prisma.product.updateMany({
      where: {
        tenantId,
        id,
        isActive: true
      },
      data: input
    });
  }

  adjustStock(tenantId: string, id: string, delta: number) {
    return this.prisma.product.updateMany({
      where: {
        id,
        tenantId
      },
      data: {
        stock: {
          increment: delta
        }
      }
    });
  }

  softDelete(tenantId: string, id: string) {
    return this.prisma.product.updateMany({
      where: {
        tenantId,
        id
      },
      data: {
        isActive: false
      }
    });
  }

  listCategories(tenantId: string) {
    return this.prisma.category.findMany({
      where: {
        tenantId,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
}
