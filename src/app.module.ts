import { Module } from '@nestjs/common';
import { dataSourceOptions } from './config/DataSource';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from './modules/empleados/employee.module';
import { SucursalesModule } from './modules/sucursales/sucursales.module';
import { CargosModule } from './modules/cargos/cargos.module';
import { LoansModule } from './modules/loans/loans.module';
import { PayrollHoursModule } from './modules/payroll-hours/payroll-hours.module';
import { DisabilityLeaveModule } from './modules/incapacidades/disability-leave.module';
import { AsistenciaModule } from './modules/asistencia/asistencia.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...dataSourceOptions, autoLoadEntities: true }),
    EmployeeModule,
    SucursalesModule,
    CargosModule,
    LoansModule,
    PayrollHoursModule,
    DisabilityLeaveModule,
    AsistenciaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
