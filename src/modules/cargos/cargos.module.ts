import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee, Position } from 'src/entities';
import { AUDIT_PORT } from 'src/application/ports/audit/audit.port';
import { WinstonAuditAdapter } from 'src/infraestructure/logging/winston/winston-audit.adapter';
import { AuthModule } from 'src/infraestructure/auth/auth.module';
import { PositionService } from './application/services/position.service';
import { POSITION_REPOSITORY_PORT } from './domain/ports/position.repository.port';
import { PositionController } from './infrastructure/http/controllers/position.controller';
import { PositionTypeOrmRepository } from './infrastructure/persistence/repositories/position.typeorm.repository';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Position, Employee])],
  controllers: [PositionController],
  providers: [
    PositionService,
    {
      provide: POSITION_REPOSITORY_PORT,
      useClass: PositionTypeOrmRepository,
    },
    {
      provide: AUDIT_PORT,
      useClass: WinstonAuditAdapter,
    },
  ],
  exports: [PositionService, POSITION_REPOSITORY_PORT],
})
export class CargosModule {}
