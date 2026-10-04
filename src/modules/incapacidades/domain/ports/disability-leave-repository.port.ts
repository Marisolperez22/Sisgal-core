import { DisabilityLeave } from 'src/entities/disability_leave.model';

export const DISABILITY_LEAVE_REPOSITORY_PORT = Symbol('DISABILITY_LEAVE_REPOSITORY_PORT');

// Filtros de consulta: ambos opcionales, se combinan con AND
export type DisabilityLeaveListFilters = {
  employeeId?: number;
  startDate?: string;
  endDate?: string;
};

export interface DisabilityLeaveRepositoryPort {
  save(disabilityLeave: DisabilityLeave): Promise<DisabilityLeave>;
  findAll(filters: DisabilityLeaveListFilters): Promise<DisabilityLeave[]>;
  // Períodos existentes del empleado que se cruzan con el rango dado (para validar superposición)
  findOverlapping(
    employeeId: number,
    startDate: string,
    endDate: string,
  ): Promise<DisabilityLeave[]>;
}
