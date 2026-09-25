import { Inject, Injectable } from '@nestjs/common';
import * as employeeRepositoryPort from '../../domain/ports/employee-repository.port';
import { RegisterEmployeeDto } from '../../infraestructure/http/dtos/register-employee.dto';
import { Employee } from 'src/entities/employee.model';
import { DocumentId } from '../../domain/value-objects/document-id.vo';
import { Salary } from '../../domain/value-objects/salary.vo';
import { DuplicateDocumentError } from '../../domain/errors/employee.errors';

@Injectable()
export class EmployeeService {
    constructor(
        @Inject(employeeRepositoryPort.EMPLOYEE_REPOSITORY_PORT)
        private readonly employeeRepository: employeeRepositoryPort.EmployeeRepositoryPort,
    ){}

    async register (dto: RegisterEmployeeDto): Promise<Employee> {
        const document =  DocumentId.create(dto.documentType, dto.documentNumber);
        const salary = Salary.create(dto.salaryBase);

        const existing = await this.employeeRepository.findByDocument(document.getNumber());
        if (existing !== null) {
            throw new DuplicateDocumentError(document.getNumber());
        }

        const employee = new Employee();
        employee.firstName = dto.firstName;
        employee.lastName = dto.lastName;
        employee.document = document.getNumber();
        employee.document_type = document.getType();
        employee.phone = dto.phone;
        employee.salary_base = salary.getvalue();
        employee.position = dto.position;
        employee.status = 'ACTIVO';

        return this.employeeRepository.save(employee);
    }
}
