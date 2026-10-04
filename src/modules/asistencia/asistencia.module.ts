import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord } from 'src/entities';
import { AUDIT_PORT } from 'src/application/ports/audit/audit.port';
import { WinstonAuditAdapter } from 'src/infraestructure/logging/winston/winston-audit.adapter';
import { AuthModule } from 'src/infraestructure/auth/auth.module';
import { EmployeeModule } from '../empleados/employee.module';
import { AttendanceHistoryService } from './application/services/attendance-history.service';
import { AttendanceTodayService } from './application/services/attendance-today.service';
import { ATTENDANCE_RECORD_REPOSITORY_PORT } from './domain/ports/attendance-record.repository.port';
import { AttendanceHistoryController } from './infrastructure/http/controllers/attendance-history.controller';
import { AttendanceTodayController } from './infrastructure/http/controllers/attendance-today.controller';
import { AttendanceRecordTypeOrmRepository } from './infrastructure/persistence/repositories/attendance-record.typeorm.repository';

@Module({
  // EmployeeModule exporta el port para consultar los empleados activos.
  imports: [
    AuthModule,
    EmployeeModule,
    TypeOrmModule.forFeature([AttendanceRecord]),
  ],
  controllers: [AttendanceHistoryController, AttendanceTodayController],
  providers: [
    AttendanceHistoryService,
    AttendanceTodayService,
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
