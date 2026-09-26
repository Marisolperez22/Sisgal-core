import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/entities/employee.model';
import { EmployeeController } from './infraestructure/http/controllers/employee.controller';
import { EmployeeService } from './application/services/employee.service';
import { EMPLOYEE_REPOSITORY_PORT } from './domain/ports/employee-repository.port';
import { EmployeeTypeOrmRepository } from './infraestructure/persistence/repositories/employee.typeorm.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Employee])],
    controllers: [EmployeeController],
    providers: [
        EmployeeService,
        {
            provide: EMPLOYEE_REPOSITORY_PORT,
            useClass: EmployeeTypeOrmRepository,
        }
    ],
})
export class EmployeeModule {}
