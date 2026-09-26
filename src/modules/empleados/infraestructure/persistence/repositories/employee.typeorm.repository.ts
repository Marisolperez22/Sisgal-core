import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { Employee } from "src/entities/employee.model";
import { EmployeeRepositoryPort } from "src/modules/empleados/domain/ports/employee-repository.port";

@Injectable()
export class EmployeeTypeOrmRepository implements EmployeeRepositoryPort {
    constructor(
        @InjectRepository(Employee)
        private readonly repository: Repository<Employee>,
    ) {}


    async save(employee: Employee): Promise<Employee> {
       return this.repository.save(employee);
    }


    async findByDocument(document: string): Promise<Employee | null> {
        return this.repository.findOne({where: {document} });
    }
}