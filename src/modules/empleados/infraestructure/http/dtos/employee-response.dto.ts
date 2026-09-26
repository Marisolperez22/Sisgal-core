import { Employee } from '../../../../../entities/employee.model';

export class EmployeeResponseDto {
  id!: number;
  firstName!: string;
  lastName!: string;
  documentType!: string;
  document!: string;
  phone!: string;
  salaryBase!: number;
  position!: string;
  status!: string;
  branchId!: number | null;

  static fromEntity(employee: Employee): EmployeeResponseDto {
    const dto = new EmployeeResponseDto();
    dto.id = employee.id;
    dto.firstName = employee.firstName;
    dto.lastName = employee.lastName;
    dto.documentType = employee.document_type;
    dto.document = employee.document;
    dto.phone = employee.phone;
    dto.salaryBase = employee.salary_base;
    dto.position = employee.position;
    dto.status = employee.status;
    const current = employee.employee_branch_assig?.find((a) => a.is_current);
    dto.branchId = current ? current.branch.id : null;
    return dto;
  }
}
