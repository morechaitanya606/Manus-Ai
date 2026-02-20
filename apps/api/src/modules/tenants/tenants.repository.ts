import { PrismaClient } from '@prisma/client';

export class TenantsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findTenantBySlug(slug: string) {
    return this.prisma.organization.findUnique({
      where: { slug },
      include: {
        stores: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            domain: true,
            logoUrl: true,
            themeConfig: true
          }
        }
      }
    });
  }
}
