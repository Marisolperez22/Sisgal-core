import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import {
    Role,
    AuthUser,
} from '../../../application/ports/auth/auth-user';

import {
    ROLES_KEY,
} from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector,
    ) {}

    canActivate(
        context: ExecutionContext,
    ): boolean {

        const requiredRoles =
            this.reflector.getAllAndOverride<Role[]>(
                ROLES_KEY,
                [
                    context.getHandler(),
                    context.getClass(),
                ],
            );

        // Si el endpoint no define roles,
        // solamente requiere autenticación.
        if (!requiredRoles?.length) {
            return true;
        }

        const request =
            context.switchToHttp().getRequest();

        const user =
            request.user as AuthUser | undefined;

        if (!user) {
            throw new ForbiddenException(
                'No se encontró el usuario autenticado.',
            );
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException(
                'El usuario no tiene permisos para realizar esta operación.',
            );
        }

        return true;
    }
}