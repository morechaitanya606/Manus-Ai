import { AppError } from '../../shared/errors.js';
import { TenantsRepository } from './tenants.repository.js';

export class TenantsService {
  constructor(private readonly repository: TenantsRepository) {}

  async getPublicTenant(slug: string) {
    const tenant = await this.repository.findTenantBySlug(slug);
    if (!tenant || !tenant.isActive) {
      throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND');
    }

    return tenant;
  }
}
