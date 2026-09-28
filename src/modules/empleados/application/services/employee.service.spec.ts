import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EmployeeService } from './employee.service';

import { EMPLOYEE_REPOSITORY_PORT } from '../../domain/ports/employee-repository.port';
import { BRANCH_REPOSITORY_PORT } from 'src/modules/sucursales/domain/ports/branch.repository.port';
import { POSITION_REPOSITORY_PORT } from '../../domain/ports/position.repository.port';

import { RegisterEmployeeDto } from '../../infraestructure/http/dtos/register-employee.dto';
import { DocumentType } from '../../domain/value-objects/document-type.enum';
import {
  DuplicateDocumentError,
  EmptyDocumentNumberError,
  InvalidDocumentFormatError,
  InvalidSalaryError,
} from '../../domain/errors/employee.errors';

import { AUDIT_PORT } from 'src/application/ports/audit/audit.port';
import { Role } from 'src/application/ports/auth/auth-user';
import type { AuthUser } from 'src/application/ports/auth/auth-user';

import { Branch, Employee, Position } from 'src/entities';

describe('EmployeeService', () => {
  let service: EmployeeService;

  const employeeRepositoryMock: {
    save: jest.Mock;
    findByDocument: jest.Mock;
    findById: jest.Mock;
  } = {
    save: jest.fn(),
    findByDocument: jest.fn(),
    findById: jest.fn(),
  };

  const branchRepositoryMock: {
    findById: jest.Mock;
  } = {
    findById: jest.fn(),
  };

  const positionRepositoryMock: {
    findById: jest.Mock;
  } = {
    findById: jest.fn(),
  };

  const auditPortMock: {
    log: jest.Mock;
  } = {
    log: jest.fn(),
  };

  const actor: AuthUser = {
    id: 'a1b2c3d4-uuid-admin',
    email: 'admin@sisgal.com',
    role: Role.ADMINISTRADOR,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: EMPLOYEE_REPOSITORY_PORT,
          useValue: employeeRepositoryMock,
        },
        {
          provide: BRANCH_REPOSITORY_PORT,
          useValue: branchRepositoryMock,
        },
        {
          provide: POSITION_REPOSITORY_PORT,
          useValue: positionRepositoryMock,
        },
        {
          provide: AUDIT_PORT,
          useValue: auditPortMock,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // =========================================================
  // Inicialización
  // =========================================================

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // =========================================================
  // register
  // =========================================================

  describe('register', () => {
    beforeEach(() => {
      employeeRepositoryMock.findByDocument.mockResolvedValue(null);
      branchRepositoryMock.findById.mockResolvedValue(crearSucursal());
      positionRepositoryMock.findById.mockResolvedValue(crearCargo());
      employeeRepositoryMock.save.mockImplementation((empleado: Employee) =>
        Promise.resolve(Object.assign(empleado, { id: 5 })),
      );
    });

    it('debe registrar un empleado con estado ACTIVO', async () => {
      const resultado = await service.register(crearDto(), actor);

      expect(resultado.id).toBe(5);
      expect(resultado.firstName).toBe('Juan');
      expect(resultado.lastName).toBe('Pérez');
      expect(resultado.document).toBe('1020304050');
      expect(resultado.document_type).toBe(DocumentType.CC);
      expect(resultado.phone).toBe('3001234567');
      expect(resultado.salary_base).toBe(1800000);
      expect(resultado.status).toBe('ACTIVO');

      expect(employeeRepositoryMock.save).toHaveBeenCalledTimes(1);
    });

    it('debe guardar el nombre del cargo como copia histórica y vincular el catálogo', async () => {
      const cargo = crearCargo({ id: 2, name: 'Auxiliar de cocina' });
      positionRepositoryMock.findById.mockResolvedValue(cargo);

      const resultado = await service.register(
        crearDto({ positionId: 2 }),
        actor,
      );

      expect(resultado.position).toBe('Auxiliar de cocina');
      expect(resultado.jobPosition).toBe(cargo);
    });

    it('debe crear la asignación inicial de sucursal como vigente y sin fecha de fin', async () => {
      const sucursal = crearSucursal();
      branchRepositoryMock.findById.mockResolvedValue(sucursal);

      const resultado = await service.register(crearDto(), actor);

      expect(resultado.employee_branch_assig).toHaveLength(1);

      const asignacion = resultado.employee_branch_assig[0];

      expect(asignacion.branch).toBe(sucursal);
      expect(asignacion.is_current).toBe(true);
      expect(asignacion.end_date).toBeNull();
      expect(asignacion.start_date).toBeInstanceOf(Date);
    });

    it('debe consultar el documento, la sucursal y el cargo recibidos', async () => {
      await service.register(crearDto({ branchId: 3, positionId: 4 }), actor);

      expect(employeeRepositoryMock.findByDocument).toHaveBeenCalledWith(
        '1020304050',
      );
      expect(branchRepositoryMock.findById).toHaveBeenCalledWith(3);
      expect(positionRepositoryMock.findById).toHaveBeenCalledWith(4);
    });

    it('debe lanzar DuplicateDocumentError cuando el documento ya existe', async () => {
      employeeRepositoryMock.findByDocument.mockResolvedValue(new Employee());

      await expect(service.register(crearDto(), actor)).rejects.toThrow(
        DuplicateDocumentError,
      );

      expect(branchRepositoryMock.findById).not.toHaveBeenCalled();
      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException cuando la sucursal no existe', async () => {
      branchRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        service.register(crearDto({ branchId: 99 }), actor),
      ).rejects.toThrow(NotFoundException);

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException cuando la sucursal está inactiva', async () => {
      branchRepositoryMock.findById.mockResolvedValue(
        crearSucursal({ is_active: false }),
      );

      await expect(service.register(crearDto(), actor)).rejects.toThrow(
        BadRequestException,
      );

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException cuando el cargo no existe', async () => {
      positionRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        service.register(crearDto({ positionId: 99 }), actor),
      ).rejects.toThrow(NotFoundException);

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException cuando el cargo está inactivo', async () => {
      positionRepositoryMock.findById.mockResolvedValue(
        crearCargo({ is_active: false }),
      );

      await expect(service.register(crearDto(), actor)).rejects.toThrow(
        BadRequestException,
      );

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe lanzar InvalidSalaryError cuando el salario no es mayor que cero', async () => {
      await expect(
        service.register(crearDto({ salaryBase: 0 }), actor),
      ).rejects.toThrow(InvalidSalaryError);

      expect(employeeRepositoryMock.findByDocument).not.toHaveBeenCalled();
      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe lanzar EmptyDocumentNumberError cuando el documento está vacío', async () => {
      await expect(
        service.register(crearDto({ documentNumber: '' }), actor),
      ).rejects.toThrow(EmptyDocumentNumberError);

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe lanzar InvalidDocumentFormatError cuando el documento no es numérico', async () => {
      await expect(
        service.register(crearDto({ documentNumber: '12AB' }), actor),
      ).rejects.toThrow(InvalidDocumentFormatError);

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe propagar el error cuando falla el guardado', async () => {
      employeeRepositoryMock.save.mockRejectedValue(new Error('Error de BD'));

      await expect(service.register(crearDto(), actor)).rejects.toThrow('Error de BD');
    });

    // =========================================================
    // Auditoría
    // =========================================================

    it('debe auditar el registro exitoso indicando quién lo realizó', async () => {
      await service.register(crearDto({ branchId: 3 }), actor);

      expect(auditPortMock.log).toHaveBeenCalledTimes(1);
      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'EMPLOYEE_CREATED',
          module: 'Empleados',
          resource: 'Employee',
          resourceId: 5,
          result: 'SUCCESS',
          metadata: { branchId: 1, positionId: 1, performedBy: actor.id },
        }),
      );
    });

    it('debe auditar el fallo cuando no se puede guardar el empleado', async () => {
      employeeRepositoryMock.save.mockRejectedValue(new Error('Error de BD'));

      await expect(service.register(crearDto(), actor)).rejects.toThrow(
        'Error de BD',
      );

      expect(auditPortMock.log).toHaveBeenCalledTimes(1);
      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'EMPLOYEE_CREATE_FAILED',
          result: 'FAILED',
          metadata: expect.objectContaining({
            performedBy: actor.id,
            error: 'Error de BD',
          }),
        }),
      );
    });

    it('no debe auditar cuando la validación falla antes de guardar', async () => {
      employeeRepositoryMock.findByDocument.mockResolvedValue(new Employee());

      await expect(service.register(crearDto(), actor)).rejects.toThrow(
        DuplicateDocumentError,
      );

      expect(auditPortMock.log).not.toHaveBeenCalled();
    });
  });

  // =========================================================
  // update
  // =========================================================

  describe('update', () => {
    beforeEach(() => {
      employeeRepositoryMock.findById.mockResolvedValue(crearEmpleado());
      employeeRepositoryMock.findByDocument.mockResolvedValue(null);
      positionRepositoryMock.findById.mockResolvedValue(crearCargo());
      employeeRepositoryMock.save.mockImplementation((empleado: Employee) =>
        Promise.resolve(empleado),
      );
    });

    it('debe actualizar el documento cuando no está en uso', async () => {
      const resultado = await service.update(
        5,
        { documentType: DocumentType.CC, documentNumber: '9998887777' },
        actor,
      );

      expect(resultado.document).toBe('9998887777');
      expect(employeeRepositoryMock.findByDocument).toHaveBeenCalledWith(
        '9998887777',
      );
    });

    it('no debe lanzar error si el documento nuevo es el mismo que ya tenía', async () => {
      employeeRepositoryMock.findByDocument.mockResolvedValue(
        crearEmpleado({ id: 5 }),
      );

      await expect(
        service.update(
          5,
          { documentType: DocumentType.CC, documentNumber: '1020304050' },
          actor,
        ),
      ).resolves.toBeDefined();
    });

    it('debe lanzar DuplicateDocumentError cuando el documento pertenece a otro empleado', async () => {
      employeeRepositoryMock.findByDocument.mockResolvedValue(
        crearEmpleado({ id: 99 }),
      );

      await expect(
        service.update(
          5,
          { documentType: DocumentType.CC, documentNumber: '1112223333' },
          actor,
        ),
      ).rejects.toThrow(DuplicateDocumentError);

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe actualizar los campos recibidos', async () => {
      const resultado = await service.update(
        5,
        { firstName: 'Julián', phone: '3009998888' },
        actor,
      );

      expect(resultado.firstName).toBe('Julián');
      expect(resultado.phone).toBe('3009998888');
      expect(employeeRepositoryMock.save).toHaveBeenCalledTimes(1);
    });

    it('debe validar el salario con la misma regla que al registrar', async () => {
      await expect(
        service.update(5, { salaryBase: 0 }, actor),
      ).rejects.toThrow(InvalidSalaryError);

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe cambiar el cargo y sincronizar el texto histórico', async () => {
      const cargo = crearCargo({ id: 2, name: 'Mesero' });
      positionRepositoryMock.findById.mockResolvedValue(cargo);

      const resultado = await service.update(5, { positionId: 2 }, actor);

      expect(resultado.position).toBe('Mesero');
      expect(positionRepositoryMock.findById).toHaveBeenCalledWith(2);
    });

    it('debe lanzar NotFoundException cuando el empleado no existe', async () => {
      employeeRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        service.update(99, { firstName: 'Julián' }, actor),
      ).rejects.toThrow(NotFoundException);

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException cuando el nuevo cargo no existe', async () => {
      positionRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        service.update(5, { positionId: 99 }, actor),
      ).rejects.toThrow(NotFoundException);

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException cuando el nuevo cargo está inactivo', async () => {
      positionRepositoryMock.findById.mockResolvedValue(
        crearCargo({ is_active: false }),
      );

      await expect(
        service.update(5, { positionId: 3 }, actor),
      ).rejects.toThrow(BadRequestException);

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe auditar la actualización exitosa', async () => {
      await service.update(5, { firstName: 'Julián' }, actor);

      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'EMPLOYEE_UPDATED',
          resourceId: 5,
          result: 'SUCCESS',
          metadata: { performedBy: actor.id },
        }),
      );
    });

    it('debe auditar el fallo cuando no se puede guardar', async () => {
      employeeRepositoryMock.save.mockRejectedValue(new Error('Error de BD'));

      await expect(
        service.update(5, { firstName: 'Julián' }, actor),
      ).rejects.toThrow('Error de BD');

      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'EMPLOYEE_UPDATE_FAILED',
          result: 'FAILED',
        }),
      );
    });
  });
});

// =========================================================
// Utilidades
// =========================================================

function crearDto(
  overrides: Partial<RegisterEmployeeDto> = {},
): RegisterEmployeeDto {
  return {
    firstName: 'Juan',
    lastName: 'Pérez',
    documentType: DocumentType.CC,
    documentNumber: '1020304050',
    phone: '3001234567',
    salaryBase: 1800000,
    positionId: 1,
    branchId: 1,
    ...overrides,
  };
}

function crearSucursal(overrides: Partial<Branch> = {}): Branch {
  return Object.assign(new Branch(), {
    id: 1,
    name: 'Sucursal Centro',
    is_active: true,
    ...overrides,
  });
}

function crearCargo(overrides: Partial<Position> = {}): Position {
  return Object.assign(new Position(), {
    id: 1,
    name: 'Auxiliar de cocina',
    is_active: true,
    ...overrides,
  });
}

function crearEmpleado(overrides: Partial<Employee> = {}): Employee {
  return Object.assign(new Employee(), {
    id: 5,
    firstName: 'Juan',
    lastName: 'Pérez',
    document: '1020304050',
    document_type: DocumentType.CC,
    phone: '3001234567',
    salary_base: 1800000,
    position: 'Auxiliar de cocina',
    status: 'ACTIVO',
    employee_branch_assig: [],
    ...overrides,
  });
}
