import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { Employee } from "src/entities/employee.model";
import { EmployeeRepositoryPort, EmployeeListFilters } from "src/modules/empleados/domain/ports/employee-repository.port";

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

    async findById(id: number): Promise<Employee | null> {
        return this.repository.findOne({
            where: { id },
            relations: {
                jobPosition: true,
                employee_branch_assig: { branch: true },
            },
        });
    }

    async findAll(filters: EmployeeListFilters): Promise<Employee[]> {
        const queryBuilder = this.repository
            .createQueryBuilder('employee')
            .leftJoinAndSelect('employee.jobPosition', 'jobPosition')
            .leftJoinAndSelect(
                'employee.employee_branch_assig',
                'currentAssignment',
                'currentAssignment.is_current = true',
            )
            .leftJoinAndSelect('currentAssignment.branch', 'branch')
            .orderBy('employee.id', 'ASC');

        if (filters.search) {
            queryBuilder.andWhere(
                '(employee."firstName" ILIKE :search OR employee."lastName" ILIKE :search OR employee.document ILIKE :search)',
                { search: `%${filters.search}%` },
            );
        }
        if (filters.branchId) {
            queryBuilder.andWhere('branch.id = :branchId', { branchId: filters.branchId });
        }
        if (filters.positionId) {
            queryBuilder.andWhere('jobPosition.id = :positionId', { positionId: filters.positionId });
        }

        return queryBuilder.getMany();
    }
}