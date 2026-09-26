import { Module } from '@nestjs/common';

import { AUTH_PORT } from '../../application/ports/auth/auth.port';

import { SupabaseJwtService } from './supabase-jwt.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
    providers: [
        {
            provide: AUTH_PORT,
            useClass: SupabaseJwtService,
        },
        JwtAuthGuard,
        RolesGuard,
    ],
    exports: [
        AUTH_PORT,
        JwtAuthGuard,
        RolesGuard,
    ],
})
export class AuthModule {}