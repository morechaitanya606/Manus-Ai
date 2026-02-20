import { PrismaClient } from '@prisma/client';

export class AdminRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async metrics(tenantId: string) {
    const [orders, paidOrders, users, designJobs, revenue] = await Promise.all([
      this.prisma.order.count({ where: { tenantId } }),
      this.prisma.order.count({ where: { tenantId, paymentStatus: 'SUCCEEDED' } }),
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.designJob.count({ where: { tenantId } }),
      this.prisma.order.aggregate({
        where: { tenantId, paymentStatus: 'SUCCEEDED' },
        _sum: { totalAmount: true }
      })
    ]);

    const [platformAdminCount, storeOwnerCount, storeManagerCount, customerCount] = await Promise.all([
      this.prisma.user.count({ where: { tenantId, role: 'PLATFORM_ADMIN' } }),
      this.prisma.user.count({ where: { tenantId, role: 'STORE_OWNER' } }),
      this.prisma.user.count({ where: { tenantId, role: 'STORE_MANAGER' } }),
      this.prisma.user.count({ where: { tenantId, role: 'CUSTOMER' } })
    ]);

    return {
      orders,
      paidOrders,
      users,
      designJobs,
      revenue: Number(revenue._sum.totalAmount ?? 0),
      roleDistribution: {
        PLATFORM_ADMIN: platformAdminCount,
        STORE_OWNER: storeOwnerCount,
        STORE_MANAGER: storeManagerCount,
        CUSTOMER: customerCount
      }
    };
  }
}
