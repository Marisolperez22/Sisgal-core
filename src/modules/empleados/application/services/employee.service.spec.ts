import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EmployeeService } from './employee.service';

import { EMPLOYEE_REPOSITORY_PORT } from '../../domain/ports/employee-repository.port';
import { BRANCH_REPOSITORY_PORT } from 'src/modules/sucursales/domain/ports/branch.repository.port';

import { RegisterEmployeeDto } from '../../infraestructure/http/dtos/register-employee.dto';
import { DocumentType } from '../../domain/value-objects/document-type.enum';
import {
  DuplicateDocumentError,
  EmptyDocumentNumberError,
  InvalidDocumentFormatError,
  InvalidSalaryError,
} from '../../domain/errors/employee.errors';

import { Branch, Employee } from 'src/entities';

describe('EmployeeService', () => {
  let service: EmployeeService;

  const employeeRepositoryMock: {
    save: jest.Mock;
    findByDocument: jest.Mock;
  } = {
    save: jest.fn(),
    findByDocument: jest.fn(),
  };

  const branchRepositoryMock: {
    findById: jest.Mock;
  } = {
    findById: jest.fn(),
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
      employeeRepositoryMock.save.mockImplementation((empleado: Employee) =>
        Promise.resolve(Object.assign(empleado, { id: 5 })),
      );
    });

    it('debe registrar un empleado con estado ACTIVO', async () => {
      const resultado = await service.register(crearDto());

      expect(resultado.id).toBe(5);
      expect(resultado.firstName).toBe('Juan');
      expect(resultado.lastName).toBe('Pérez');
      expect(resultado.document).toBe('1020304050');
      expect(resultado.document_type).toBe(DocumentType.CC);
      expect(resultado.phone).toBe('3001234567');
      expect(resultado.salary_base).toBe(1800000);
      expect(resultado.position).toBe('Auxiliar de cocina');
      expect(resultado.status).toBe('ACTIVO');

      expect(employeeRepositoryMock.save).toHaveBeenCalledTimes(1);
    });

    it('debe crear la asignación inicial de sucursal como vigente y sin fecha de fin', async () => {
      const sucursal = crearSucursal();
      branchRepositoryMock.findById.mockResolvedValue(sucursal);

      const resultado = await service.register(crearDto());

      expect(resultado.employee_branch_assig).toHaveLength(1);

      const asignacion = resultado.employee_branch_assig[0];

      expect(asignacion.branch).toBe(sucursal);
      expect(asignacion.is_current).toBe(true);
      expect(asignacion.end_date).toBeNull();
      expect(asignacion.start_date).toBeInstanceOf(Date);
    });

    it('debe consultar el documento y la sucursal recibidos', async () => {
      await service.register(crearDto({ branchId: 3 }));

      expect(employeeRepositoryMock.findByDocument).toHaveBeenCalledWith(
        '1020304050',
      );
      expect(branchRepositoryMock.findById).toHaveBeenCalledWith(3);
    });

    it('debe lanzar DuplicateDocumentError cuando el documento ya existe', async () => {
      employeeRepositoryMock.findByDocument.mockResolvedValue(new Employee());

      await expect(service.register(crearDto())).rejects.toThrow(
        DuplicateDocumentError,
      );

      expect(branchRepositoryMock.findById).not.toHaveBeenCalled();
      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException cuando la sucursal no existe', async () => {
      branchRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        service.register(crearDto({ branchId: 99 })),
      ).rejects.toThrow(NotFoundException);

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException cuando la sucursal está inactiva', async () => {
      branchRepositoryMock.findById.mockResolvedValue(
        crearSucursal({ is_active: false }),
      );

      await expect(service.register(crearDto())).rejects.toThrow(
        BadRequestException,
      );

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe lanzar InvalidSalaryError cuando el salario no es mayor que cero', async () => {
      await expect(
        service.register(crearDto({ salaryBase: 0 })),
      ).rejects.toThrow(InvalidSalaryError);

      expect(employeeRepositoryMock.findByDocument).not.toHaveBeenCalled();
      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe lanzar EmptyDocumentNumberError cuando el documento está vacío', async () => {
      await expect(
        service.register(crearDto({ documentNumber: '' })),
      ).rejects.toThrow(EmptyDocumentNumberError);

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe lanzar InvalidDocumentFormatError cuando el documento no es numérico', async () => {
      await expect(
        service.register(crearDto({ documentNumber: '12AB' })),
      ).rejects.toThrow(InvalidDocumentFormatError);

      expect(employeeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('debe propagar el error cuando falla el guardado', async () => {
      employeeRepositoryMock.save.mockRejectedValue(new Error('Error de BD'));

      await expect(service.register(crearDto())).rejects.toThrow('Error de BD');
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
    position: 'Auxiliar de cocina',
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
