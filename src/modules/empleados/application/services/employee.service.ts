import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as employeeRepositoryPort from '../../domain/ports/employee-repository.port';
import { RegisterEmployeeDto } from '../../infraestructure/http/dtos/register-employee.dto';
import { ListEmployeesQueryDto } from '../../infraestructure/http/dtos/list-employees-query.dto';
import { EmployeeResponseDto } from '../../infraestructure/http/dtos/employee-response.dto';
import { Employee } from 'src/entities/employee.model';
import { DocumentId } from '../../domain/value-objects/document-id.vo';
import { Salary } from '../../domain/value-objects/salary.vo';
import { DuplicateDocumentError } from '../../domain/errors/employee.errors';
import {
  BRANCH_REPOSITORY_PORT,
  type BranchRepositoryPort,
} from 'src/modules/sucursales/domain/ports/branch.repository.port';
import {
  POSITION_REPOSITORY_PORT,
  type PositionRepositoryPort,
} from '../../domain/ports/position.repository.port';
import { EmployeeBranchAssignment } from 'src/entities/employee-branch-assignment.model';
import { AUDIT_PORT } from 'src/application/ports/audit/audit.port';
import type { AuditPort } from 'src/application/ports/audit/audit.port';
import type { AuthUser } from 'src/application/ports/auth/auth-user';

@Injectable()
export class EmployeeService {
  constructor(
    @Inject(employeeRepositoryPort.EMPLOYEE_REPOSITORY_PORT)
    private readonly employeeRepository: employeeRepositoryPort.EmployeeRepositoryPort,

    @Inject(BRANCH_REPOSITORY_PORT)
    private readonly branchRepository: BranchRepositoryPort,

    @Inject(POSITION_REPOSITORY_PORT)
    private readonly positionRepository: PositionRepositoryPort,

    @Inject(AUDIT_PORT)
    private readonly auditPort: AuditPort,
  ) {}

  async register(dto: RegisterEmployeeDto, actor: AuthUser): Promise<Employee> {
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

    // El cargo es obligatorio: debe existir y estar activo
    const jobPosition = await this.positionRepository.findById(
      dto.positionId,
    );
    if (!jobPosition) {
      throw new NotFoundException(
        `No se encontró un cargo con el identificador ${dto.positionId}.`,
      );
    }
    if (!jobPosition.is_active) {
      throw new BadRequestException(
        `El cargo con identificador ${dto.positionId} está inactivo.`,
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
    // "position" queda como copia histórica del nombre; "jobPosition" es el vínculo vivo al catálogo
    employee.position = jobPosition.name;
    employee.jobPosition = jobPosition;
    employee.status = 'ACTIVO';
    // El cascade de la entidad guarda empleado y asignación en una sola transacción
    employee.employee_branch_assig = [assignment];

    // Se audita el resultado del guardado, indicando quién realizó el registro
    try {
      const empleadoCreado = await this.employeeRepository.save(employee);

      this.auditPort.log({
        action: 'EMPLOYEE_CREATED',
        module: 'Empleados',
        resource: 'Employee',
        resourceId: empleadoCreado.id,
        result: 'SUCCESS',
        message: `Se registró el empleado "${empleadoCreado.firstName} ${empleadoCreado.lastName}".`,
        metadata: {
          branchId: branch.id,
          positionId: jobPosition.id,
          performedBy: actor.id,
        },
      });

      return empleadoCreado;
    } catch (error) {
      this.auditPort.log({
        action: 'EMPLOYEE_CREATE_FAILED',
        module: 'Empleados',
        resource: 'Employee',
        result: 'FAILED',
        message: 'Falló el registro de un empleado.',
        metadata: {
          branchId: dto.branchId,
          positionId: dto.positionId,
          performedBy: actor.id,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }

  // Búsqueda y filtros son opcionales y se combinan con AND
  async findAll(query: ListEmployeesQueryDto): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeeRepository.findAll(query);
    return employees.map((employee) => EmployeeResponseDto.fromEntity(employee));
  }
}
