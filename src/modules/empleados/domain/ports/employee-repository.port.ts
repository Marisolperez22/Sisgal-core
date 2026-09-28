import { Employee } from 'src/entities/employee.model';

export const EMPLOYEE_REPOSITORY_PORT = Symbol('EMPLOYEE_REPOSITORY_PORT');

// Filtros del listado: todos opcionales, se combinan con AND
export type EmployeeListFilters = {
  search?: string;
  branchId?: number;
  positionId?: number;
};

export interface EmployeeRepositoryPort {
  save(employee: Employee): Promise<Employee>;
  findByDocument(document: string): Promise<Employee | null>;
  findAll(filters: EmployeeListFilters): Promise<Employee[]>;
}