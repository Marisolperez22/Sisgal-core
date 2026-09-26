import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { BranchService } from './branch.service';

import { BRANCH_REPOSITORY_PORT } from '../../domain/ports/branch.repository.port';

import { COMPANY_REPOSITORY_PORT } from '../../domain/ports/company.repository.port';

import { AUDIT_PORT, AuditPort } from 'src/application/ports/audit/audit.port';

import { Branch } from 'src/entities';

describe('BranchService', () => {
  let service: BranchService;

  const branchRepositoryMock: {
    findAll: jest.Mock;
    findActivas: jest.Mock;
    findById: jest.Mock;
    findByName: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    deactivate: jest.Mock;
    hasEmployees: jest.Mock;
    hasHistoricalRecords: jest.Mock;
  } = {
    findAll: jest.fn(),
    findActivas: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
    hasEmployees: jest.fn(),
    hasHistoricalRecords: jest.fn(),
  };

  const companyRepositoryMock: {
    findById: jest.Mock;
  } = {
    findById: jest.fn(),
  };

  const auditPortMock: {
    log: jest.Mock;
  } = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchService,
        {
          provide: BRANCH_REPOSITORY_PORT,
          useValue: branchRepositoryMock,
        },
        {
          provide: COMPANY_REPOSITORY_PORT,
          useValue: companyRepositoryMock,
        },
        {
          provide: AUDIT_PORT,
          useValue: auditPortMock,
        },
      ],
    }).compile();

    service = module.get<BranchService>(BranchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // Inicialización
  // =========================================================

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // =========================================================
  // obtenerTodas
  // =========================================================

  describe('obtenerTodas', () => {
    it('debe retornar todas las sucursales', async () => {
      const sucursal1 = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
        city: 'Medellín',
        is_active: true,
      });

      const sucursal2 = crearSucursal({
        id: 2,
        name: 'Sucursal Sur',
        city: 'Envigado',
        is_active: false,
      });

      branchRepositoryMock.findAll.mockResolvedValue([sucursal1, sucursal2]);

      const resultado = await service.obtenerTodas();

      expect(resultado).toHaveLength(2);
      expect(resultado[0].id).toBe(1);
      expect(resultado[1].id).toBe(2);

      expect(branchRepositoryMock.findAll).toHaveBeenCalledTimes(1);

      expect(branchRepositoryMock.findAll).toHaveBeenCalledWith(undefined);
    });

    it('debe consultar solo las sucursales activas cuando se recibe true', async () => {
      const sucursales = [
        crearSucursal({
          id: 1,
          name: 'Sucursal Centro',
          is_active: true,
        }),
      ];

      branchRepositoryMock.findAll.mockResolvedValue(sucursales);

      const resultado = await service.obtenerTodas(true);

      expect(resultado).toHaveLength(1);

      expect(branchRepositoryMock.findAll).toHaveBeenCalledWith(true);
    });

    it('debe consultar solo las sucursales inactivas cuando se recibe false', async () => {
      const sucursales = [
        crearSucursal({
          id: 2,
          name: 'Sucursal Sur',
          is_active: false,
        }),
      ];

      branchRepositoryMock.findAll.mockResolvedValue(sucursales);

      const resultado = await service.obtenerTodas(false);

      expect(resultado).toHaveLength(1);

      expect(branchRepositoryMock.findAll).toHaveBeenCalledWith(false);
    });

    it('debe retornar un arreglo vacío cuando no existen sucursales', async () => {
      branchRepositoryMock.findAll.mockResolvedValue([]);

      const resultado = await service.obtenerTodas();

      expect(resultado).toEqual([]);
    });
  });

  // =========================================================
  // obtenerActivas
  // =========================================================

  describe('obtenerActivas', () => {
    it('debe retornar las sucursales activas', async () => {
      const sucursales = [
        crearSucursal({
          id: 1,
          name: 'Sucursal Centro',
          city: 'Medellín',
          is_active: true,
        }),
        crearSucursal({
          id: 2,
          name: 'Sucursal Norte',
          city: 'Bello',
          is_active: true,
        }),
      ];

      branchRepositoryMock.findActivas.mockResolvedValue(sucursales);

      const resultado = await service.obtenerActivas();

      expect(resultado).toHaveLength(2);
      expect(resultado[0].id).toBe(1);
      expect(resultado[1].id).toBe(2);

      expect(branchRepositoryMock.findActivas).toHaveBeenCalledTimes(1);
    });

    it('debe retornar un arreglo vacío cuando no existen sucursales activas', async () => {
      branchRepositoryMock.findActivas.mockResolvedValue([]);

      const resultado = await service.obtenerActivas();

      expect(resultado).toEqual([]);
    });
  });

  // =========================================================
  // obtenerPorId
  // =========================================================

  describe('obtenerPorId', () => {
    it('debe retornar una sucursal cuando existe', async () => {
      const sucursal = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
        city: 'Medellín',
      });

      branchRepositoryMock.findById.mockResolvedValue(sucursal);

      const resultado = await service.obtenerPorId(1);

      expect(resultado.id).toBe(1);
      expect(resultado.name).toBe('Sucursal Centro');

      expect(branchRepositoryMock.findById).toHaveBeenCalledTimes(1);

      expect(branchRepositoryMock.findById).toHaveBeenCalledWith(1);
    });

    it('debe lanzar NotFoundException cuando la sucursal no existe', async () => {
      branchRepositoryMock.findById.mockResolvedValue(null);

      await expect(service.obtenerPorId(999)).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.obtenerPorId(999)).rejects.toThrow(
        'No se encontró una sucursal con el identificador 999.',
      );
    });
  });

  // =========================================================
  // crear
  // =========================================================

  describe('crear', () => {
    const dto = {
      nombre: 'Sucursal Centro',
      ciudad: 'Medellín',
      telefono: '3001234567',
      direccion: 'Carrera 1 # 10-20',
      companyId: 1,
    };

    const company = {
      id: 1,
      name: 'JS Burguer Parrilla',
      nit: '123456789',
      legal_rep: 'Juan Pérez',
      branches: [],
    };

    it('debe crear una sucursal correctamente', async () => {
      const sucursalCreada = crearSucursal({
        id: 1,
        name: dto.nombre,
        city: dto.ciudad,
        phone: dto.telefono,
        address: dto.direccion,
        is_active: true,
        company,
      });

      companyRepositoryMock.findById.mockResolvedValue(company);

      branchRepositoryMock.findByName.mockResolvedValue(null);

      branchRepositoryMock.create.mockResolvedValue(sucursalCreada);

      const resultado = await service.crear(dto);

      expect(resultado.id).toBe(1);
      expect(resultado.name).toBe(dto.nombre);

      expect(companyRepositoryMock.findById).toHaveBeenCalledWith(
        dto.companyId,
      );

      expect(branchRepositoryMock.findByName).toHaveBeenCalledWith(dto.nombre);

      expect(branchRepositoryMock.create).toHaveBeenCalledTimes(1);

      const sucursalEnviada = branchRepositoryMock.create.mock.calls[0][0];

      expect(sucursalEnviada).toBeInstanceOf(Branch);

      expect(sucursalEnviada.name).toBe(dto.nombre);

      expect(sucursalEnviada.city).toBe(dto.ciudad);

      expect(sucursalEnviada.phone).toBe(dto.telefono);

      expect(sucursalEnviada.address).toBe(dto.direccion);

      expect(sucursalEnviada.is_active).toBe(true);

      expect(sucursalEnviada.company).toBe(company);

      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'BRANCH_CREATED',
          module: 'Sucursales',
          resource: 'Branch',
          resourceId: 1,
          result: 'SUCCESS',
        }),
      );
    });

    it('debe lanzar NotFoundException cuando la empresa no existe', async () => {
      companyRepositoryMock.findById.mockResolvedValue(null);

      await expect(service.crear(dto)).rejects.toThrow(NotFoundException);

      await expect(service.crear(dto)).rejects.toThrow(
        'No se encontró una empresa con el identificador 1.',
      );

      expect(branchRepositoryMock.findByName).not.toHaveBeenCalled();

      expect(branchRepositoryMock.create).not.toHaveBeenCalled();

      expect(auditPortMock.log).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException cuando ya existe una sucursal con el mismo nombre', async () => {
      const sucursalExistente = crearSucursal({
        id: 10,
        name: dto.nombre,
      });

      companyRepositoryMock.findById.mockResolvedValue(company);

      branchRepositoryMock.findByName.mockResolvedValue(sucursalExistente);

      await expect(service.crear(dto)).rejects.toThrow(ConflictException);

      await expect(service.crear(dto)).rejects.toThrow(
        `Ya existe una sucursal con el nombre "${dto.nombre}".`,
      );

      expect(branchRepositoryMock.create).not.toHaveBeenCalled();

      expect(auditPortMock.log).not.toHaveBeenCalled();
    });

    it('debe establecer teléfono en null cuando no se proporciona', async () => {
      const dtoSinTelefono = {
        ...dto,
        telefono: undefined,
      };

      const sucursalCreada = crearSucursal({
        id: 1,
        name: dto.nombre,
        city: dto.ciudad,
        phone: null,
        address: dto.direccion,
        is_active: true,
        company,
      });

      companyRepositoryMock.findById.mockResolvedValue(company);

      branchRepositoryMock.findByName.mockResolvedValue(null);

      branchRepositoryMock.create.mockResolvedValue(sucursalCreada);

      await service.crear(dtoSinTelefono);

      const sucursalEnviada = branchRepositoryMock.create.mock.calls[0][0];

      expect(sucursalEnviada.phone).toBeNull();
    });

    it('debe registrar auditoría fallida cuando ocurre un error al crear', async () => {
      const error = new Error('Error de persistencia');

      companyRepositoryMock.findById.mockResolvedValue(company);

      branchRepositoryMock.findByName.mockResolvedValue(null);

      branchRepositoryMock.create.mockRejectedValue(error);

      await expect(service.crear(dto)).rejects.toThrow(error);

      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'BRANCH_CREATE_FAILED',
          module: 'Sucursales',
          resource: 'Branch',
          result: 'FAILED',
          message: `Falló la creación de la sucursal "${dto.nombre}".`,
          metadata: expect.objectContaining({
            companyId: dto.companyId,
            error: 'Error de persistencia',
          }),
        }),
      );
    });
  });

  // =========================================================
  // actualizar
  // =========================================================

  describe('actualizar', () => {
    it('debe actualizar una sucursal correctamente', async () => {
      const sucursal = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
        city: 'Medellín',
        phone: '3001111111',
        address: 'Dirección anterior',
        is_active: true,
      });

      const dto = {
        nombre: 'Sucursal Centro Actualizada',
        ciudad: 'Bogotá',
        telefono: '3002222222',
        direccion: 'Dirección nueva',
      };

      const sucursalActualizada = crearSucursal({
        id: 1,
        name: dto.nombre,
        city: dto.ciudad,
        phone: dto.telefono,
        address: dto.direccion,
        is_active: true,
      });

      branchRepositoryMock.findById.mockResolvedValue(sucursal);

      branchRepositoryMock.findByName.mockResolvedValue(null);

      branchRepositoryMock.update.mockResolvedValue(sucursalActualizada);

      const resultado = await service.actualizar(1, dto);

      expect(resultado.id).toBe(1);
      expect(resultado.name).toBe(dto.nombre);

      expect(branchRepositoryMock.findById).toHaveBeenCalledWith(1);

      expect(branchRepositoryMock.findByName).toHaveBeenCalledWith(dto.nombre);

      expect(branchRepositoryMock.update).toHaveBeenCalledTimes(1);

      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'BRANCH_UPDATED',
          module: 'Sucursales',
          resource: 'Branch',
          resourceId: 1,
          result: 'SUCCESS',
          metadata: expect.objectContaining({
            changes: expect.objectContaining({
              nombre: {
                anterior: 'Sucursal Centro',
                nuevo: 'Sucursal Centro Actualizada',
              },
              ciudad: {
                anterior: 'Medellín',
                nuevo: 'Bogotá',
              },
              telefono: {
                anterior: '3001111111',
                nuevo: '3002222222',
              },
              direccion: {
                anterior: 'Dirección anterior',
                nuevo: 'Dirección nueva',
              },
            }),
          }),
        }),
      );
    });

    it('debe lanzar NotFoundException cuando la sucursal no existe', async () => {
      branchRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        service.actualizar(999, {
          ciudad: 'Medellín',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(branchRepositoryMock.update).not.toHaveBeenCalled();

      expect(auditPortMock.log).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException cuando el nuevo nombre ya pertenece a otra sucursal', async () => {
      const sucursal = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
      });

      const otraSucursal = crearSucursal({
        id: 2,
        name: 'Sucursal Norte',
      });

      branchRepositoryMock.findById.mockResolvedValue(sucursal);

      branchRepositoryMock.findByName.mockResolvedValue(otraSucursal);

      await expect(
        service.actualizar(1, {
          nombre: 'Sucursal Norte',
        }),
      ).rejects.toThrow(ConflictException);

      await expect(
        service.actualizar(1, {
          nombre: 'Sucursal Norte',
        }),
      ).rejects.toThrow(
        'Ya existe una sucursal con el nombre "Sucursal Norte".',
      );

      expect(branchRepositoryMock.update).not.toHaveBeenCalled();

      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'BRANCH_UPDATE_FAILED',
          result: 'FAILED',
          resourceId: 1,
        }),
      );
    });

    it('no debe consultar duplicados cuando el nombre no cambia', async () => {
      const sucursal = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
        city: 'Medellín',
      });

      const sucursalActualizada = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
        city: 'Bogotá',
      });

      branchRepositoryMock.findById.mockResolvedValue(sucursal);

      branchRepositoryMock.update.mockResolvedValue(sucursalActualizada);

      await service.actualizar(1, {
        nombre: 'Sucursal Centro',
        ciudad: 'Bogotá',
      });

      expect(branchRepositoryMock.findByName).not.toHaveBeenCalled();

      expect(branchRepositoryMock.update).toHaveBeenCalledTimes(1);
    });

    it('debe actualizar únicamente los campos enviados', async () => {
      const sucursal = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
        city: 'Medellín',
        phone: '3001111111',
        address: 'Dirección original',
      });

      branchRepositoryMock.findById.mockResolvedValue(sucursal);

      branchRepositoryMock.update.mockImplementation(
        async (branch: Branch) => branch,
      );

      const dto = {
        ciudad: 'Bogotá',
      };

      await service.actualizar(1, dto);

      expect(sucursal.name).toBe('Sucursal Centro');

      expect(sucursal.city).toBe('Bogotá');

      expect(sucursal.phone).toBe('3001111111');

      expect(sucursal.address).toBe('Dirección original');
    });

    it('debe registrar auditoría fallida cuando ocurre un error durante la actualización', async () => {
      const sucursal = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
      });

      const error = new Error('Error al actualizar');

      branchRepositoryMock.findById.mockResolvedValue(sucursal);

      branchRepositoryMock.update.mockRejectedValue(error);

      await expect(
        service.actualizar(1, {
          ciudad: 'Bogotá',
        }),
      ).rejects.toThrow(error);

      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'BRANCH_UPDATE_FAILED',
          module: 'Sucursales',
          resource: 'Branch',
          resourceId: 1,
          result: 'FAILED',
          metadata: expect.objectContaining({
            error: 'Error al actualizar',
          }),
        }),
      );
    });
  });

  // =========================================================
  // eliminar
  // =========================================================

  describe('eliminar', () => {
    it('debe inactivar una sucursal correctamente', async () => {
      const sucursal = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
        is_active: true,
      });

      branchRepositoryMock.findById.mockResolvedValue(sucursal);

      branchRepositoryMock.hasEmployees.mockResolvedValue(false);

      branchRepositoryMock.hasHistoricalRecords.mockResolvedValue(false);

      branchRepositoryMock.deactivate.mockResolvedValue(undefined);

      await service.eliminar(1);

      expect(branchRepositoryMock.findById).toHaveBeenCalledWith(1);

      expect(branchRepositoryMock.hasEmployees).toHaveBeenCalledWith(1);

      expect(branchRepositoryMock.hasHistoricalRecords).toHaveBeenCalledWith(1);

      expect(branchRepositoryMock.deactivate).toHaveBeenCalledWith(1);

      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'BRANCH_DEACTIVATED',
          module: 'Sucursales',
          resource: 'Branch',
          resourceId: 1,
          result: 'SUCCESS',
        }),
      );
    });

    it('debe lanzar NotFoundException cuando la sucursal no existe', async () => {
      branchRepositoryMock.findById.mockResolvedValue(null);

      await expect(service.eliminar(999)).rejects.toThrow(NotFoundException);

      expect(branchRepositoryMock.hasEmployees).not.toHaveBeenCalled();

      expect(branchRepositoryMock.deactivate).not.toHaveBeenCalled();

      expect(auditPortMock.log).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException cuando la sucursal ya está inactiva', async () => {
      const sucursal = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
        is_active: false,
      });

      branchRepositoryMock.findById.mockResolvedValue(sucursal);

      await expect(service.eliminar(1)).rejects.toThrow(ConflictException);

      await expect(service.eliminar(1)).rejects.toThrow(
        'La sucursal con el identificador 1 ya se encuentra inactiva.',
      );

      expect(branchRepositoryMock.hasEmployees).not.toHaveBeenCalled();

      expect(branchRepositoryMock.deactivate).not.toHaveBeenCalled();

      expect(auditPortMock.log).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException cuando la sucursal tiene empleados asociados', async () => {
      const sucursal = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
        is_active: true,
      });

      branchRepositoryMock.findById.mockResolvedValue(sucursal);

      branchRepositoryMock.hasEmployees.mockResolvedValue(true);

      await expect(service.eliminar(1)).rejects.toThrow(ConflictException);

      await expect(service.eliminar(1)).rejects.toThrow(
        'No se puede desactivar la sucursal porque tiene empleados asociados.',
      );

      expect(branchRepositoryMock.hasHistoricalRecords).not.toHaveBeenCalled();

      expect(branchRepositoryMock.deactivate).not.toHaveBeenCalled();

      expect(auditPortMock.log).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException cuando la sucursal tiene registros históricos', async () => {
      const sucursal = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
        is_active: true,
      });

      branchRepositoryMock.findById.mockResolvedValue(sucursal);

      branchRepositoryMock.hasEmployees.mockResolvedValue(false);

      branchRepositoryMock.hasHistoricalRecords.mockResolvedValue(true);

      await expect(service.eliminar(1)).rejects.toThrow(ConflictException);

      await expect(service.eliminar(1)).rejects.toThrow(
        'No se puede desactivar la sucursal porque tiene registros asociados.',
      );

      expect(branchRepositoryMock.deactivate).not.toHaveBeenCalled();

      expect(auditPortMock.log).not.toHaveBeenCalled();
    });

    it('debe registrar auditoría fallida cuando ocurre un error al inactivar', async () => {
      const sucursal = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
        is_active: true,
      });

      const error = new Error('Error de persistencia');

      branchRepositoryMock.findById.mockResolvedValue(sucursal);

      branchRepositoryMock.hasEmployees.mockResolvedValue(false);

      branchRepositoryMock.hasHistoricalRecords.mockResolvedValue(false);

      branchRepositoryMock.deactivate.mockRejectedValue(error);

      await expect(service.eliminar(1)).rejects.toThrow(error);

      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'BRANCH_DEACTIVATE_FAILED',
          module: 'Sucursales',
          resource: 'Branch',
          resourceId: 1,
          result: 'FAILED',
          metadata: expect.objectContaining({
            error: 'Error de persistencia',
          }),
        }),
      );
    });
  });
});

/**
 * Crea una entidad Branch para utilizarla en las pruebas.
 * Los valores por defecto permiten construir escenarios
 * modificando únicamente las propiedades relevantes.
 */
function crearSucursal(overrides: Partial<Branch> = {}): Branch {
  const branch = new Branch();

  branch.id = 1;
  branch.name = 'Sucursal Test';
  branch.city = 'Medellín';
  branch.phone = '3000000000';
  branch.address = 'Dirección de prueba';
  branch.is_active = true;

  Object.assign(branch, overrides);

  return branch;
}
