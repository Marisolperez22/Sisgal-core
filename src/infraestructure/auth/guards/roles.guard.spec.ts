import {
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard';
import { Role } from '../../../application/ports/auth/auth-user';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const createExecutionContext = (
    user?: {
      id: string;
      email?: string;
      role: Role;
    },
  ): ExecutionContext => {
    const request = {
      user,
    };

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);
  });

  describe('canActivate', () => {
    it('debe permitir el acceso cuando el endpoint no define roles', () => {
      reflector.getAllAndOverride.mockReturnValue(
        undefined,
      );

      const context = createExecutionContext();

      const result = guard.canActivate(context);

      expect(result).toBe(true);

      expect(
        reflector.getAllAndOverride,
      ).toHaveBeenCalledWith(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );
    });

    it('debe permitir el acceso cuando los roles requeridos están vacíos', () => {
      reflector.getAllAndOverride.mockReturnValue([]);

      const context = createExecutionContext();

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('debe permitir el acceso cuando el usuario tiene el rol requerido', () => {
      reflector.getAllAndOverride.mockReturnValue([
        Role.ADMINISTRADOR,
      ]);

      const user = {
        id: 'user-123',
        email: 'admin@test.com',
        role: Role.ADMINISTRADOR,
      };

      const context = createExecutionContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('debe rechazar el acceso cuando no existe un usuario autenticado', () => {
      reflector.getAllAndOverride.mockReturnValue([
        Role.ADMINISTRADOR,
      ]);

      const context = createExecutionContext();

      expect(() => guard.canActivate(context)).toThrow(
        new ForbiddenException(
          'No se encontró el usuario autenticado.',
        ),
      );
    });

    it('debe rechazar el acceso cuando el usuario no tiene el rol requerido', () => {
      reflector.getAllAndOverride.mockReturnValue([
        Role.ADMINISTRADOR,
      ]);

      const user = {
        id: 'user-123',
        email: 'user@test.com',
        role: 'OTRO_ROL' as Role,
      };

      const context = createExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow(
        new ForbiddenException(
          'El usuario no tiene permisos para realizar esta operación.',
        ),
      );
    });

    it('debe permitir el acceso cuando el usuario tiene uno de los roles requeridos', () => {
      const segundoRol = 'SUPERVISOR' as Role;

      reflector.getAllAndOverride.mockReturnValue([
        Role.ADMINISTRADOR,
        segundoRol,
      ]);

      const user = {
        id: 'user-123',
        email: 'supervisor@test.com',
        role: segundoRol,
      };

      const context = createExecutionContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('debe rechazar el acceso cuando el usuario no coincide con ninguno de los roles requeridos', () => {
      const segundoRol = 'SUPERVISOR' as Role;

      reflector.getAllAndOverride.mockReturnValue([
        Role.ADMINISTRADOR,
        segundoRol,
      ]);

      const user = {
        id: 'user-123',
        email: 'empleado@test.com',
        role: 'EMPLEADO' as Role,
      };

      const context = createExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow(
        new ForbiddenException(
          'El usuario no tiene permisos para realizar esta operación.',
        ),
      );
    });
  });
});