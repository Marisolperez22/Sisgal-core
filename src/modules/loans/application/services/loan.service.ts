import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LOAN_REPOSITORY_PORT } from '../../domain/ports/loan.repository.port';
import type {
  LoanFilters,
  LoanIndicators,
  LoanRepositoryPort,
} from '../../domain/ports/loan.repository.port';
import { LoanIndicatorsResponseDto } from '../../infrastructure/http/dtos/loan-indicators-response.dto';
import { LoanResponseDto } from '../../infrastructure/http/dtos/loan-response.dto';

@Injectable()
export class LoanService {
  constructor(
    @Inject(LOAN_REPOSITORY_PORT)
    private readonly loanRepository: LoanRepositoryPort,
  ) {}

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
