import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AUTH_PORT } from '../../../application/ports/auth/auth.port';

import type { AuthPort } from '../../../application/ports/auth/auth.port';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_PORT)
    private readonly authPort: AuthPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        'No se proporcionó el token de autenticación.',
      );
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'El header Authorization debe utilizar el esquema Bearer.',
      );
    }

    const user = await this.authPort.verifyToken(token);

    request.user = user;

    return true;
  }
}
