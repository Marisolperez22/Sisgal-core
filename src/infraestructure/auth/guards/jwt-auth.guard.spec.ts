import {
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthPort } from '../../../application/ports/auth/auth.port';
import { Role } from '../../../application/ports/auth/auth-user';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const authPortMock: jest.Mocked<AuthPort> = {
    verifyToken: jest.fn(),
  };

  const createExecutionContext = (
    authorization?: string,
  ): ExecutionContext => {
    const request = {
      headers: {
        authorization,
      },
      user: undefined,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    guard = new JwtAuthGuard(authPortMock);
  });

  describe('canActivate', () => {
    it('debe permitir el acceso con un token Bearer válido', async () => {
      const user = {
        id: 'user-123',
        email: 'admin@test.com',
        role: Role.ADMINISTRADOR,
      };

      authPortMock.verifyToken.mockResolvedValue(user);

      const context = createExecutionContext(
        'Bearer token-valido',
      );

      const result = await guard.canActivate(context);

      expect(result).toBe(true);

      expect(authPortMock.verifyToken).toHaveBeenCalledWith(
        'token-valido',
      );

      const request = context
        .switchToHttp()
        .getRequest();

      expect(request.user).toEqual(user);
    });

    it('debe rechazar la solicitud cuando no existe el header Authorization', async () => {
      const context = createExecutionContext();

      await expect(
        guard.canActivate(context),
      ).rejects.toThrow(
        new UnauthorizedException(
          'No se proporcionó el token de autenticación.',
        ),
      );

      expect(
        authPortMock.verifyToken,
      ).not.toHaveBeenCalled();
    });

    it('debe rechazar la solicitud cuando el esquema no es Bearer', async () => {
      const context = createExecutionContext(
        'Basic token-valido',
      );

      await expect(
        guard.canActivate(context),
      ).rejects.toThrow(
        new UnauthorizedException(
          'El header Authorization debe utilizar el esquema Bearer.',
        ),
      );

      expect(
        authPortMock.verifyToken,
      ).not.toHaveBeenCalled();
    });

    it('debe rechazar la solicitud cuando no se proporciona el token', async () => {
      const context = createExecutionContext(
        'Bearer',
      );

      await expect(
        guard.canActivate(context),
      ).rejects.toThrow(
        new UnauthorizedException(
          'El header Authorization debe utilizar el esquema Bearer.',
        ),
      );

      expect(
        authPortMock.verifyToken,
      ).not.toHaveBeenCalled();
    });

    it('debe rechazar la solicitud cuando el header tiene un esquema diferente y sin token', async () => {
      const context = createExecutionContext(
        'Basic',
      );

      await expect(
        guard.canActivate(context),
      ).rejects.toThrow(
        new UnauthorizedException(
          'El header Authorization debe utilizar el esquema Bearer.',
        ),
      );

      expect(
        authPortMock.verifyToken,
      ).not.toHaveBeenCalled();
    });

    it('debe propagar el error cuando el token es inválido', async () => {
      const error = new UnauthorizedException(
        'Token de autenticación inválido o expirado.',
      );

      authPortMock.verifyToken.mockRejectedValue(error);

      const context = createExecutionContext(
        'Bearer token-invalido',
      );

      await expect(
        guard.canActivate(context),
      ).rejects.toThrow(error);

      expect(
        authPortMock.verifyToken,
      ).toHaveBeenCalledWith('token-invalido');
    });
  });
});