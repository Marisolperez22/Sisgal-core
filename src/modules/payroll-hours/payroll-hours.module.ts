import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkRateConfig } from 'src/entities/work-rate-config.model';
import { WorkdayConfig } from 'src/entities/workday-config.model';
import { PayrollHoursService } from './application/services/payroll-hours.service';
import { PAYROLL_HOURS_REPOSITORY_PORT } from './domain/ports/payroll-hours.repository.port';
import { PayrollHoursController } from './infrastructure/http/controllers/payroll-hours.controller';
import { PayrollHoursTypeOrmRepository } from './infrastructure/persistence/repositories/payroll-hours.typeorm.repository';
import { AuthModule } from 'src/infraestructure/auth/auth.module';
import { AsistenciaModule } from '../asistencia/asistencia.module';
import { ATTENDANCE_RECORD_REPOSITORY_PORT } from '../asistencia/domain/ports/attendance-record.repository.port';
import { AttendanceRecordTypeOrmRepository } from '../asistencia/infrastructure/persistence/repositories/attendance-record.typeorm.repository';
import { AttendanceRecord, Holiday } from 'src/entities';

@Module({
  imports: [
    AuthModule,
    AsistenciaModule,
    TypeOrmModule.forFeature([
      WorkdayConfig,
      WorkRateConfig,
      AttendanceRecord,
      Holiday,
    ]),
  ],
  controllers: [PayrollHoursController],
  providers: [
    PayrollHoursService,
    {
      provide: PAYROLL_HOURS_REPOSITORY_PORT,
      useClass: PayrollHoursTypeOrmRepository,
    },
    {
      provide: ATTENDANCE_RECORD_REPOSITORY_PORT,
      useClass: AttendanceRecordTypeOrmRepository,
    },
  ],
  exports: [PayrollHoursService],
})
export class PayrollHoursModule {}
