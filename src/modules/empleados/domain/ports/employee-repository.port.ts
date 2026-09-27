import { Employee } from 'src/entities/employee.model';

export const EMPLOYEE_REPOSITORY_PORT = Symbol('EMPLOYEE_REPOSITORY_PORT');

export interface EmployeeRepositoryPort {
  save(employee: Employee): Promise<Employee>;
  findByDocument(document: string): Promise<Employee | null>;
}