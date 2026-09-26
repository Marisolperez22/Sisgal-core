import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as employeeRepositoryPort from '../../domain/ports/employee-repository.port';
import { RegisterEmployeeDto } from '../../infraestructure/http/dtos/register-employee.dto';
import { Employee } from 'src/entities/employee.model';
import { DocumentId } from '../../domain/value-objects/document-id.vo';
import { Salary } from '../../domain/value-objects/salary.vo';
import { DuplicateDocumentError } from '../../domain/errors/employee.errors';
import {
  BRANCH_REPOSITORY_PORT,
  type BranchRepositoryPort,
} from 'src/modules/sucursales/domain/ports/branch.repository.port';
import { EmployeeBranchAssignment } from 'src/entities/employee-branch-assignment.model';

@Injectable()
export class EmployeeService {
  constructor(
    @Inject(employeeRepositoryPort.EMPLOYEE_REPOSITORY_PORT)
    private readonly employeeRepository: employeeRepositoryPort.EmployeeRepositoryPort,

    @Inject(BRANCH_REPOSITORY_PORT)
    private readonly branchRepository: BranchRepositoryPort,
  ) {}

  async register(dto: RegisterEmployeeDto): Promise<Employee> {
    // Los value objects validan tipo/número de documento y salario (lanzan error de dominio si son inválidos)
    const document = DocumentId.create(dto.documentType, dto.documentNumber);
    const salary = Salary.create(dto.salaryBase);

    // No se permite registrar dos empleados con el mismo documento
    const existing = await this.employeeRepository.findByDocument(
      document.getNumber(),
    );
    if (existing !== null) {
      throw new DuplicateDocumentError(document.getNumber());
    }

    // La sede es obligatoria: debe existir y estar activa
    const branch = await this.branchRepository.findById(dto.branchId);
    if (!branch) {
      throw new NotFoundException(
        `No se encontró una sucursal con el identificador ${dto.branchId}.`,
      );
    }
    if (!branch.is_active) {
      throw new BadRequestException(
        `La sucursal con identificador ${dto.branchId} está inactiva.`,
      );
    }

    // Asignación inicial de sede: vigente (is_current) y sin fecha de fin (end_date null)
    const assignment = new EmployeeBranchAssignment();
    assignment.branch = branch;
    assignment.start_date = new Date();
    assignment.end_date = null;
    assignment.is_current = true;

    const employee = new Employee();
    employee.firstName = dto.firstName;
    employee.lastName = dto.lastName;
    employee.document = document.getNumber();
    employee.document_type = document.getType();
    employee.phone = dto.phone;
    employee.salary_base = salary.getvalue();
    employee.position = dto.position;
    employee.status = 'ACTIVO';
    // El cascade de la entidad guarda empleado y asignación en una sola transacción
    employee.employee_branch_assig = [assignment];

    return this.employeeRepository.save(employee);
  }
}
