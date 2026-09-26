import { UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import { SupabaseJwtService } from './supabase-jwt.service';
import { Role } from '../../application/ports/auth/auth-user';

jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn(),
  jwtVerify: jest.fn(),
}));

describe('SupabaseJwtService', () => {
  let service: SupabaseJwtService;

  const mockJwks = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.SUPABASE_URL = 'https://test.supabase.co';

    (createRemoteJWKSet as jest.Mock).mockReturnValue(mockJwks);

    service = new SupabaseJwtService();
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
  });

  describe('constructor', () => {
    it('debe crear el servicio cuando SUPABASE_URL está configurada', () => {
      expect(service).toBeDefined();

      expect(createRemoteJWKSet).toHaveBeenCalledWith(
        new URL('https://test.supabase.co/auth/v1/.well-known/jwks.json'),
      );
    });

    it('debe lanzar un error cuando SUPABASE_URL no está configurada', () => {
      delete process.env.SUPABASE_URL;

      (createRemoteJWKSet as jest.Mock).mockClear();

      expect(() => new SupabaseJwtService()).toThrow(
        'SUPABASE_URL no está configurada.',
      );

      expect(createRemoteJWKSet).not.toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    it('debe validar el token y retornar el usuario autenticado', async () => {
      const payload = {
        sub: 'user-123',
        email: 'admin@test.com',
        app_metadata: {
          role: 'administrador',
        },
      };

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload,
      });

      const resultado = await service.verifyToken('token-valido');

      expect(resultado).toEqual({
        id: 'user-123',
        email: 'admin@test.com',
        role: Role.ADMINISTRADOR,
      });

      expect(jwtVerify).toHaveBeenCalledWith('token-valido', mockJwks, {
        issuer: 'https://test.supabase.co/auth/v1',
        audience: 'authenticated',
      });
    });

    it('debe aceptar el rol administrador sin importar mayúsculas o minúsculas', async () => {
      const payload = {
        sub: 'user-123',
        app_metadata: {
          role: 'ADMINISTRADOR',
        },
      };

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload,
      });

      const resultado = await service.verifyToken('token-valido');

      expect(resultado.role).toBe(Role.ADMINISTRADOR);
    });

    it('debe retornar email como undefined cuando el email no es string', async () => {
      const payload = {
        sub: 'user-123',
        email: 12345,
        app_metadata: {
          role: 'administrador',
        },
      };

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload,
      });

      const resultado = await service.verifyToken('token-valido');

      expect(resultado).toEqual({
        id: 'user-123',
        email: undefined,
        role: Role.ADMINISTRADOR,
      });
    });

    it('debe lanzar UnauthorizedException cuando jwtVerify falla', async () => {
      (jwtVerify as jest.Mock).mockRejectedValue(new Error('Token inválido'));

      await expect(service.verifyToken('token-invalido')).rejects.toThrow(
        new UnauthorizedException(
          'Token de autenticación inválido o expirado.',
        ),
      );
    });

    it('debe lanzar UnauthorizedException cuando el token está expirado', async () => {
      (jwtVerify as jest.Mock).mockRejectedValue(new Error('JWTExpired'));

      await expect(service.verifyToken('token-expirado')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe convertir errores de mapPayloadToUser en UnauthorizedException', async () => {
      const payload = {
        app_metadata: {
          role: 'administrador',
        },
      };

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload,
      });

      await expect(service.verifyToken('token-sin-sub')).rejects.toThrow(
        'Token de autenticación inválido o expirado.',
      );
    });

    it('debe convertir la ausencia de rol en UnauthorizedException', async () => {
      const payload = {
        sub: 'user-123',
        email: 'user@test.com',
        app_metadata: {},
      };

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload,
      });

      await expect(service.verifyToken('token-sin-rol')).rejects.toThrow(
        'Token de autenticación inválido o expirado.',
      );
    });

    it('debe convertir un rol no permitido en UnauthorizedException', async () => {
      const payload = {
        sub: 'user-123',
        app_metadata: {
          role: 'usuario',
        },
      };

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload,
      });

      await expect(service.verifyToken('token-rol-invalido')).rejects.toThrow(
        'Token de autenticación inválido o expirado.',
      );
    });
  });
});
