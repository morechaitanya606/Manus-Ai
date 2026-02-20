import { PrismaClient, Role, User } from '@prisma/client';

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findTenantBySlug(slug: string) {
    return this.prisma.organization.findUnique({ where: { slug } });
  }

  findUserByEmail(tenantId: string, email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email
        }
      }
    });
  }

  createUser(input: {
    tenantId: string;
    email: string;
    passwordHash: string;
    displayName: string;
    role?: Role;
  }) {
    return this.prisma.user.create({
      data: {
        tenantId: input.tenantId,
        email: input.email,
        passwordHash: input.passwordHash,
        displayName: input.displayName,
        role: input.role ?? Role.CUSTOMER
      }
    });
  }

  createRefreshToken(input: {
    tenantId: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return this.prisma.refreshToken.create({
      data: input
    });
  }

  async replaceRefreshToken(input: {
    tenantId: string;
    userId: string;
    oldTokenHash: string;
    newTokenHash: string;
    expiresAt: Date;
  }) {
    await this.prisma.refreshToken.updateMany({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
        tokenHash: input.oldTokenHash,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });

    return this.createRefreshToken({
      tenantId: input.tenantId,
      userId: input.userId,
      tokenHash: input.newTokenHash,
      expiresAt: input.expiresAt
    });
  }

  findRefreshToken(tenantId: string, tokenHash: string) {
    return this.prisma.refreshToken.findFirst({
      where: {
        tenantId,
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });
  }

  revokeAllRefreshTokens(tenantId: string, userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: {
        tenantId,
        userId,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  getUserById(tenantId: string, userId: string) {
    return this.prisma.user.findFirst({
      where: {
        tenantId,
        id: userId
      }
    });
  }
}
