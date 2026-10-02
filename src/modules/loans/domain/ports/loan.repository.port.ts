import { EmployeeLoan } from 'src/entities';
import { LoanStatus } from '../../enums/loan-status.enum';

export const LOAN_REPOSITORY_PORT = Symbol('LOAN_REPOSITORY_PORT');

export interface LoanFilters {
  empleadoId?: number;
  nombreEmpleado?: string;
  documento?: string;
  estado?: LoanStatus;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface LoanIndicators {
  cantidadPrestamosActivos: number;
  montoTotalPrestamosActivos: number;
}

export interface LoanRepositoryPort {
  findAll(filters: LoanFilters): Promise<EmployeeLoan[]>;
  getIndicators(): Promise<LoanIndicators>;
}
