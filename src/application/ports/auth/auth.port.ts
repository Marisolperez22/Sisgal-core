import { AuthUser } from './auth-user';

export const AUTH_PORT = Symbol('AUTH_PORT');

export interface AuthPort {
    verifyToken(token: string): Promise<AuthUser>;
}