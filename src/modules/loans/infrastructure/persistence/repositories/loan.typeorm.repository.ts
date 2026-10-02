import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeLoan } from 'src/entities';
import {
  LoanFilters,
  LoanRepositoryPort,
} from '../../../domain/ports/loan.repository.port';

@Injectable()
export class LoanTypeOrmRepository implements LoanRepositoryPort {
  constructor(
    @InjectRepository(EmployeeLoan)
    private readonly repository: Repository<EmployeeLoan>,
  ) {}

  async findAll(filters: LoanFilters): Promise<EmployeeLoan[]> {
    const query = this.repository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.employee', 'employee');

    if (filters.empleadoId !== undefined) {
      query.andWhere('loan.employeeId = :empleadoId', {
        empleadoId: filters.empleadoId,
      });
    }

    if (filters.nombreEmpleado !== undefined) {
      query.andWhere(
        "CONCAT(employee.firstName, ' ', employee.lastName) ILIKE :nombreEmpleado",
        { nombreEmpleado: `%${filters.nombreEmpleado}%` },
      );
    }

    if (filters.documento !== undefined) {
      query.andWhere('employee.document = :documento', {
        documento: filters.documento,
      });
    }

    if (filters.estado !== undefined) {
      query.andWhere('loan.status = :estado', { estado: filters.estado });
    }

    if (filters.fechaDesde !== undefined) {
      query.andWhere('loan.grantedAt >= :fechaDesde', {
        fechaDesde: filters.fechaDesde,
      });
    }

    if (filters.fechaHasta !== undefined) {
      query.andWhere('loan.grantedAt <= :fechaHasta', {
        fechaHasta: filters.fechaHasta,
      });
    }

    return query
      .orderBy('loan.grantedAt', 'DESC')
      .addOrderBy('loan.id', 'DESC')
      .getMany();
  }
}
