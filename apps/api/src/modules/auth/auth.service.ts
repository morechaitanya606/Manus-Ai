import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors.js';
import { hashToken } from '../../shared/crypto.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '../../shared/auth.js';
import { AuthRepository } from './auth.repository.js';

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  async signup(input: {
    tenantSlug: string;
    email: string;
    password: string;
    displayName: string;
  }) {
    const tenant = await this.repository.findTenantBySlug(input.tenantSlug);
    if (!tenant) {
      throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    }

    const exists = await this.repository.findUserByEmail(tenant.id, input.email);
    if (exists) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.repository.createUser({
      tenantId: tenant.id,
      email: input.email,
      passwordHash,
      displayName: input.displayName
    });

    return this.issueTokens({
      tenantId: tenant.id,
      userId: user.id,
      email: user.email,
      role: user.role
    });
  }

  async login(input: {
    tenantSlug: string;
    email: string;
    password: string;
  }) {
    const tenant = await this.repository.findTenantBySlug(input.tenantSlug);
    if (!tenant) {
      throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    }

    const user = await this.repository.findUserByEmail(tenant.id, input.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const matches = await bcrypt.compare(input.password, user.passwordHash);
    if (!matches) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    return this.issueTokens({
      tenantId: tenant.id,
      userId: user.id,
      email: user.email,
      role: user.role
    });
  }

  async refresh(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const currentHash = hashToken(refreshToken);

    const existing = await this.repository.findRefreshToken(decoded.tenantId, currentHash);
    if (!existing) {
      throw new AppError('Refresh token invalid', 401, 'REFRESH_INVALID');
    }

    const nextTokenId = nanoid(16);
    const nextRefreshToken = signRefreshToken({
      sub: existing.user.id,
      tenantId: existing.user.tenantId,
      tokenVersion: nextTokenId
    });

    await this.repository.replaceRefreshToken({
      tenantId: existing.user.tenantId,
      userId: existing.user.id,
      oldTokenHash: currentHash,
      newTokenHash: hashToken(nextRefreshToken),
      expiresAt: this.refreshExpiryDate()
    });

    const accessToken = signAccessToken({
      sub: existing.user.id,
      tenantId: existing.user.tenantId,
      role: existing.user.role,
      email: existing.user.email
    });

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      expiresIn: env.ACCESS_TOKEN_TTL,
      user: {
        id: existing.user.id,
        tenantId: existing.user.tenantId,
        email: existing.user.email,
        role: existing.user.role,
        displayName: existing.user.displayName
      }
    };
  }

  async logout(tenantId: string, userId: string) {
    await this.repository.revokeAllRefreshTokens(tenantId, userId);
    return { success: true };
  }

  async me(tenantId: string, userId: string) {
    const user = await this.repository.getUserById(tenantId, userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      tenantId: user.tenantId
    };
  }

  private async issueTokens(input: {
    tenantId: string;
    userId: string;
    email: string;
    role: 'PLATFORM_ADMIN' | 'STORE_OWNER' | 'STORE_MANAGER' | 'CUSTOMER';
  }) {
    const tokenVersion = nanoid(16);

    const accessToken = signAccessToken({
      sub: input.userId,
      tenantId: input.tenantId,
      role: input.role,
      email: input.email
    });

    const refreshToken = signRefreshToken({
      sub: input.userId,
      tenantId: input.tenantId,
      tokenVersion
    });

    await this.repository.createRefreshToken({
      tenantId: input.tenantId,
      userId: input.userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: this.refreshExpiryDate()
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.ACCESS_TOKEN_TTL,
      user: {
        id: input.userId,
        tenantId: input.tenantId,
        email: input.email,
        role: input.role
      }
    };
  }

  private refreshExpiryDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + env.REFRESH_TOKEN_TTL_DAYS);
    return date;
  }
}
