import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeLoan } from 'src/entities';
import { LOAN_REPOSITORY_PORT } from '../../domain/ports/loan.repository.port';
import type {
  LoanFilters,
  LoanIndicators,
  LoanRepositoryPort,
} from '../../domain/ports/loan.repository.port';
import { LoanIndicatorsResponseDto } from '../../infrastructure/http/dtos/loan-indicators-response.dto';
import { CreateLoanDto } from '../../infrastructure/http/dtos/create-loan.dto';
import { LoanResponseDto } from '../../infrastructure/http/dtos/loan-response.dto';
import { LoanStatus } from '../../enums/loan-status.enum';

@Injectable()
export class LoanService {
  constructor(
    @Inject(LOAN_REPOSITORY_PORT)
    private readonly loanRepository: LoanRepositoryPort,
  ) {}

  async crear(dto: CreateLoanDto): Promise<LoanResponseDto> {
    const employee = await this.loanRepository.findEmployeeById(dto.employeeId);
    if (!employee) {
      throw new NotFoundException(
        `No se encontró el empleado con identificador ${dto.employeeId}.`,
      );
    }

    const loan = new EmployeeLoan();
    loan.employee = employee;
    loan.employeeId = employee.id;
    loan.totalAmount = dto.totalAmount;
    loan.installmentAmount = Number(
      (dto.totalAmount / dto.totalInstallments).toFixed(2),
    );
    loan.totalInstallments = dto.totalInstallments;
    loan.pendingInstallments = dto.totalInstallments;
    loan.outstandingBalance = dto.totalAmount;
    loan.grantedAt = new Date(`${dto.grantedAt}T00:00:00.000Z`);
    loan.status = LoanStatus.ACTIVO;

    const savedLoan = await this.loanRepository.save(loan);
    return LoanResponseDto.fromEntity(savedLoan);
  }

  async obtenerTodos(filters: LoanFilters): Promise<LoanResponseDto[]> {
    if (
      filters.fechaDesde &&
      filters.fechaHasta &&
      filters.fechaDesde > filters.fechaHasta
    ) {
      throw new BadRequestException(
        'La fechaDesde no puede ser posterior a fechaHasta.',
      );
    }

    const loans = await this.loanRepository.findAll(filters);
    return loans.map((loan) => LoanResponseDto.fromEntity(loan));
  }

  async obtenerIndicadores(): Promise<LoanIndicatorsResponseDto> {
    const indicators: LoanIndicators =
      await this.loanRepository.getIndicators();
    const response = new LoanIndicatorsResponseDto();
    response.cantidadPrestamosActivos = indicators.cantidadPrestamosActivos;
    response.montoTotalPrestamosActivos = indicators.montoTotalPrestamosActivos;
    return response;
  }
}
