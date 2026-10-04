import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { DisabilityLeave } from "src/entities/disability_leave.model";
import {
    DisabilityLeaveRepositoryPort,
    DisabilityLeaveListFilters,
} from "src/modules/incapacidades/domain/ports/disability-leave-repository.port";

@Injectable()
export class DisabilityLeaveTypeOrmRepository implements DisabilityLeaveRepositoryPort {
    constructor(
        @InjectRepository(DisabilityLeave)
        private readonly repository: Repository<DisabilityLeave>,
    ) {}

    async save(disabilityLeave: DisabilityLeave): Promise<DisabilityLeave> {
        return this.repository.save(disabilityLeave);
    }

    async findAll(filters: DisabilityLeaveListFilters): Promise<DisabilityLeave[]> {
        const queryBuilder = this.repository
            .createQueryBuilder('disabilityLeave')
            .leftJoinAndSelect('disabilityLeave.employee', 'employee')
            .orderBy('disabilityLeave.start_date', 'DESC');

        if (filters.employeeId) {
            queryBuilder.andWhere('employee.id = :employeeId', { employeeId: filters.employeeId });
        }
        if (filters.startDate) {
            queryBuilder.andWhere('disabilityLeave.end_date >= :startDate', { startDate: filters.startDate });
        }
        if (filters.endDate) {
            queryBuilder.andWhere('disabilityLeave.start_date <= :endDate', { endDate: filters.endDate });
        }

        return queryBuilder.getMany();
    }

    // Dos períodos se cruzan si uno empieza antes de que el otro termine y
    // termina después de que el otro empiece (comparación estándar de rangos)
    async findOverlapping(
        employeeId: number,
        startDate: string,
        endDate: string,
    ): Promise<DisabilityLeave[]> {
        return this.repository
            .createQueryBuilder('disabilityLeave')
            .innerJoin('disabilityLeave.employee', 'employee')
            .where('employee.id = :employeeId', { employeeId })
            .andWhere('disabilityLeave.start_date <= :endDate', { endDate })
            .andWhere('disabilityLeave.end_date >= :startDate', { startDate })
            .getMany();
    }
}
