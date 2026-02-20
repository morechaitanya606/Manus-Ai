import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Role } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  tenantId: string;
  role: Role;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tenantId: string;
  tokenVersion: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as any,
    issuer: 'atelier-api',
    audience: 'atelier-web'
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d` as any,
    issuer: 'atelier-api',
    audience: 'atelier-web'
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'atelier-api',
    audience: 'atelier-web'
  }) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'atelier-api',
    audience: 'atelier-web'
  }) as RefreshTokenPayload;
}
