import { Role } from '@prisma/client';
import { AppError } from '../../shared/errors.js';
import { AdminRepository } from './admin.repository.js';

const ADMIN_ROLES: Role[] = ['PLATFORM_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'];

export class AdminService {
  constructor(private readonly repository: AdminRepository) {}

  async metrics(tenantId: string, role: Role) {
    if (!ADMIN_ROLES.includes(role)) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    return this.repository.metrics(tenantId);
  }
}
