import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/entities/employee.model';
import { EmployeeController } from './infraestructure/http/controllers/employee.controller';
import { EmployeeService } from './application/services/employee.service';
import { EMPLOYEE_REPOSITORY_PORT } from './domain/ports/employee-repository.port';
import { EmployeeTypeOrmRepository } from './infraestructure/persistence/repositories/employee.typeorm.repository';
import { AuthModule } from '../../infraestructure/auth/auth.module';
import { SucursalesModule } from '../sucursales/sucursales.module';
import { AUDIT_PORT } from '../../application/ports/audit/audit.port';
import { WinstonAuditAdapter } from '../../infraestructure/logging/winston/winston-audit.adapter';

@Module({
    // AuthModule aporta los guards; SucursalesModule exporta el port para consultar sucursales
    imports: [AuthModule, SucursalesModule,TypeOrmModule.forFeature([Employee])],
    controllers: [EmployeeController],
    providers: [
        EmployeeService,
        {
            provide: EMPLOYEE_REPOSITORY_PORT,
            useClass: EmployeeTypeOrmRepository,
        },
        // Auditoría de operaciones (mismo adaptador Winston que usa sucursales)
        {
            provide: AUDIT_PORT,
            useClass: WinstonAuditAdapter,
        },
    ],
})
export class EmployeeModule {}
