import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord } from 'src/entities';
import { AUDIT_PORT } from 'src/application/ports/audit/audit.port';
import { WinstonAuditAdapter } from 'src/infraestructure/logging/winston/winston-audit.adapter';
import { AuthModule } from 'src/infraestructure/auth/auth.module';
import { AttendanceHistoryService } from './application/services/attendance-history.service';
import { ATTENDANCE_RECORD_REPOSITORY_PORT } from './domain/ports/attendance-record.repository.port';
import { AttendanceHistoryController } from './infrastructure/http/controllers/attendance-history.controller';
import { AttendanceRecordTypeOrmRepository } from './infrastructure/persistence/repositories/attendance-record.typeorm.repository';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([AttendanceRecord])],
  controllers: [AttendanceHistoryController],
  providers: [
    AttendanceHistoryService,
    {
      provide: ATTENDANCE_RECORD_REPOSITORY_PORT,
      useClass: AttendanceRecordTypeOrmRepository,
    },
    {
      provide: AUDIT_PORT,
      useClass: WinstonAuditAdapter,
    },
  ],
  exports: [AttendanceHistoryService, ATTENDANCE_RECORD_REPOSITORY_PORT],
})
export class AsistenciaModule {}
