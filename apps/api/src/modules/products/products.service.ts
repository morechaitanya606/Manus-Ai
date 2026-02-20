import { Role } from '@prisma/client';
import { AppError } from '../../shared/errors.js';
import { ProductsRepository } from './products.repository.js';

const ADMIN_ROLES: Role[] = ['PLATFORM_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'];

export class ProductsService {
  constructor(private readonly repository: ProductsRepository) {}

  async list(tenantId: string, query: {
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
    return this.repository.listProducts(tenantId, query);
  }

  async getById(tenantId: string, id: string) {
    const product = await this.repository.getProductById(tenantId, id);
    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    return product;
  }

  async create(tenantId: string, role: Role, input: Record<string, unknown>) {
    if (!ADMIN_ROLES.includes(role)) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    return this.repository.createProduct(tenantId, {
      ...(input as Record<string, unknown>),
      reservedStock: 0,
      isActive: true
    } as any);
  }

  async update(tenantId: string, role: Role, id: string, input: Record<string, unknown>) {
    if (!ADMIN_ROLES.includes(role)) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    const result = await this.repository.updateProduct(tenantId, id, input as never);
    if (result.count === 0) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    return this.getById(tenantId, id);
  }

  async updateStock(tenantId: string, role: Role, id: string, delta: number) {
    if (!ADMIN_ROLES.includes(role)) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    return this.repository.adjustStock(tenantId, id, delta);
  }

  async remove(tenantId: string, role: Role, id: string) {
    if (!ADMIN_ROLES.includes(role)) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    const result = await this.repository.softDelete(tenantId, id);
    if (result.count === 0) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    return { id, deleted: true };
  }

  categories(tenantId: string) {
    return this.repository.listCategories(tenantId);
  }
}
