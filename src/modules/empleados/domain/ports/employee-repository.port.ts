import { Employee } from 'src/entities/employee.model';

export const EMPLOYEE_REPOSITORY_PORT = Symbol('EMPLOYEE_REPOSITORY_PORT');

// Filtros del listado: todos opcionales, se combinan con AND
export type EmployeeListFilters = {
  search?: string;
  branchId?: number;
  positionId?: number;
  status?: 'ACTIVO' | 'INACTIVO';
};

export interface EmployeeRepositoryPort {
  save(employee: Employee): Promise<Employee>;
  findByDocument(document: string): Promise<Employee | null>;
  findAll(filters: EmployeeListFilters): Promise<Employee[]>;
  findById(id: number): Promise<Employee | null>;
  deactivate(id: number): Promise<void>;
  hasHistoricalRecords(id: number): Promise<boolean>;
}