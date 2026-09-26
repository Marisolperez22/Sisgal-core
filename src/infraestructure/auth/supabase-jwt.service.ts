import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

import { AuthUser, Role } from '../../application/ports/auth/auth-user';

import { AuthPort } from '../../application/ports/auth/auth.port';

@Injectable()
export class SupabaseJwtService implements AuthPort {
  private readonly issuer: string;

  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL no está configurada.');
    }

    this.issuer = `${supabaseUrl}/auth/v1`;

    this.jwks = createRemoteJWKSet(
      new URL(`${this.issuer}/.well-known/jwks.json`),
    );
  }

  async verifyToken(token: string): Promise<AuthUser> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: 'authenticated',
      });

      return this.mapPayloadToUser(payload);
    } catch (error) {
      console.error('Error validando JWT:', error);

      throw new UnauthorizedException(
        'Token de autenticación inválido o expirado.',
      );
    }
  }

  private mapPayloadToUser(payload: JWTPayload): AuthUser {
    if (!payload.sub) {
      throw new UnauthorizedException(
        'El token no contiene un identificador de usuario.',
      );
    }

    const role = this.extractRole(payload);

    if (!role) {
      throw new UnauthorizedException(
        'El usuario no tiene un rol configurado.',
      );
    }

    return {
      id: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      role,
    };
  }

  private extractRole(payload: JWTPayload): Role | undefined {
    const appMetadata = payload.app_metadata;

    if (
      typeof appMetadata !== 'object' ||
      appMetadata === null ||
      !('role' in appMetadata)
    ) {
      return undefined;
    }

    const role = appMetadata.role;

    if (typeof role !== 'string') {
      return undefined;
    }

    const normalizedRole = role.toLowerCase();

    if (normalizedRole === 'administrador') {
      return Role.ADMINISTRADOR;
    }

    return undefined;
  }
}
