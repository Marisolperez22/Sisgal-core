import { Test, TestingModule } from '@nestjs/testing';

import { DataSource, Repository } from 'typeorm';

import { BranchTypeOrmRepository } from './branch.typeorm.repository';

import { Branch } from '../../../../../entities/branch.model';

import { AttendanceRecord, EmployeeBranchAssignment } from 'src/entities';

import { BRANCH_REPOSITORY_PORT } from '../../../domain/ports/branch.repository.port';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('BranchTypeOrmRepository', () => {
  let repository: BranchTypeOrmRepository;

  const branchRepositoryMock = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const employeeBranchAssignmentRepositoryMock = {
    count: jest.fn(),
  };

  const attendanceRecordRepositoryMock = {
    count: jest.fn(),
  };

  const queryRunnerMock = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    },
  };

  const dataSourceMock = {
    createQueryRunner: jest.fn(),
  };

  beforeEach(async () => {
    dataSourceMock.createQueryRunner.mockReturnValue(queryRunnerMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchTypeOrmRepository,

        {
          provide: getRepositoryToken(Branch),
          useValue: branchRepositoryMock,
        },

        {
          provide: getRepositoryToken(EmployeeBranchAssignment),
          useValue: employeeBranchAssignmentRepositoryMock,
        },

        {
          provide: getRepositoryToken(AttendanceRecord),
          useValue: attendanceRecordRepositoryMock,
        },

        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    repository = module.get<BranchTypeOrmRepository>(BranchTypeOrmRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================
  // Inicialización
  // =========================================================

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  // =========================================================
  // findAll
  // =========================================================

  describe('findAll', () => {
    it('debe retornar todas las sucursales cuando no se proporciona filtro', async () => {
      const sucursales = [
        crearSucursal({
          id: 1,
          name: 'Sucursal Centro',
          is_active: true,
        }),
        crearSucursal({
          id: 2,
          name: 'Sucursal Sur',
          is_active: false,
        }),
      ];

      branchRepositoryMock.find.mockResolvedValue(sucursales);

      const resultado = await repository.findAll();

      expect(resultado).toEqual(sucursales);

      expect(branchRepositoryMock.find).toHaveBeenCalledTimes(1);

      expect(branchRepositoryMock.find).toHaveBeenCalledWith({
        where: {},
        relations: {
          company: true,
        },
        order: {
          name: 'ASC',
        },
      });
    });

    it('debe retornar únicamente las sucursales activas cuando soloActivas es true', async () => {
      const sucursales = [
        crearSucursal({
          id: 1,
          name: 'Sucursal Centro',
          is_active: true,
        }),
      ];

      branchRepositoryMock.find.mockResolvedValue(sucursales);

      const resultado = await repository.findAll(true);

      expect(resultado).toEqual(sucursales);

      expect(branchRepositoryMock.find).toHaveBeenCalledWith({
        where: {
          is_active: true,
        },
        relations: {
          company: true,
        },
        order: {
          name: 'ASC',
        },
      });
    });

    it('debe retornar únicamente las sucursales inactivas cuando soloActivas es false', async () => {
      const sucursales = [
        crearSucursal({
          id: 2,
          name: 'Sucursal Sur',
          is_active: false,
        }),
      ];

      branchRepositoryMock.find.mockResolvedValue(sucursales);

      const resultado = await repository.findAll(false);

      expect(resultado).toEqual(sucursales);

      expect(branchRepositoryMock.find).toHaveBeenCalledWith({
        where: {
          is_active: false,
        },
        relations: {
          company: true,
        },
        order: {
          name: 'ASC',
        },
      });
    });

    it('debe retornar un arreglo vacío cuando no existen sucursales', async () => {
      branchRepositoryMock.find.mockResolvedValue([]);

      const resultado = await repository.findAll();

      expect(resultado).toEqual([]);
    });
  });

  // =========================================================
  // findActivas
  // =========================================================

  describe('findActivas', () => {
    it('debe consultar las sucursales activas', async () => {
      const sucursales = [
        crearSucursal({
          id: 1,
          name: 'Sucursal Centro',
          is_active: true,
        }),
      ];

      branchRepositoryMock.find.mockResolvedValue(sucursales);

      const resultado = await repository.findActivas();

      expect(resultado).toEqual(sucursales);

      expect(branchRepositoryMock.find).toHaveBeenCalledWith({
        where: {
          is_active: true,
        },
        relations: {
          company: true,
        },
        order: {
          name: 'ASC',
        },
      });
    });
  });

  // =========================================================
  // findById
  // =========================================================

  describe('findById', () => {
    it('debe retornar la sucursal cuando existe', async () => {
      const sucursal = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
      });

      branchRepositoryMock.findOne.mockResolvedValue(sucursal);

      const resultado = await repository.findById(1);

      expect(resultado).toEqual(sucursal);

      expect(branchRepositoryMock.findOne).toHaveBeenCalledTimes(1);

      expect(branchRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        relations: {
          company: true,
        },
      });
    });

    it('debe retornar null cuando la sucursal no existe', async () => {
      branchRepositoryMock.findOne.mockResolvedValue(null);

      const resultado = await repository.findById(999);

      expect(resultado).toBeNull();

      expect(branchRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
        relations: {
          company: true,
        },
      });
    });
  });

  // =========================================================
  // findByName
  // =========================================================

  describe('findByName', () => {
    it('debe retornar la sucursal cuando existe el nombre', async () => {
      const sucursal = crearSucursal({
        id: 1,
        name: 'Sucursal Centro',
      });

      branchRepositoryMock.findOne.mockResolvedValue(sucursal);

      const resultado = await repository.findByName('Sucursal Centro');

      expect(resultado).toEqual(sucursal);

      expect(branchRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          name: 'Sucursal Centro',
        },
        relations: {
          company: true,
        },
      });
    });

    it('debe retornar null cuando no existe una sucursal con el nombre indicado', async () => {
      branchRepositoryMock.findOne.mockResolvedValue(null);

      const resultado = await repository.findByName('Sucursal Inexistente');

      expect(resultado).toBeNull();
    });
  });

  // =========================================================
  // create
  // =========================================================

  describe('create', () => {
    it('debe crear una sucursal dentro de una transacción', async () => {
      const sucursal = crearSucursal({
        name: 'Sucursal Centro',
      });

      const sucursalCreada = crearSucursal({
        id: 10,
        name: 'Sucursal Centro',
      });

      queryRunnerMock.manager.create.mockReturnValue(sucursalCreada);

      queryRunnerMock.manager.save.mockResolvedValue(sucursalCreada);

      const resultado = await repository.create(sucursal);

      expect(resultado).toEqual(sucursalCreada);

      expect(dataSourceMock.createQueryRunner).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.connect).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.startTransaction).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.manager.create).toHaveBeenCalledWith(
        Branch,
        sucursal,
      );

      expect(queryRunnerMock.manager.save).toHaveBeenCalledWith(
        Branch,
        sucursalCreada,
      );

      expect(queryRunnerMock.commitTransaction).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.rollbackTransaction).not.toHaveBeenCalled();

      expect(queryRunnerMock.release).toHaveBeenCalledTimes(1);
    });

    it('debe hacer rollback cuando ocurre un error al crear', async () => {
      const sucursal = crearSucursal({
        name: 'Sucursal Centro',
      });

      const error = new Error('Error de persistencia');

      queryRunnerMock.manager.create.mockReturnValue(sucursal);

      queryRunnerMock.manager.save.mockRejectedValue(error);

      await expect(repository.create(sucursal)).rejects.toThrow(error);

      expect(queryRunnerMock.startTransaction).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.commitTransaction).not.toHaveBeenCalled();

      expect(queryRunnerMock.release).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================
  // update
  // =========================================================

  describe('update', () => {
    it('debe actualizar una sucursal dentro de una transacción', async () => {
      const sucursal = crearSucursal({
        id: 1,
        name: 'Sucursal Actualizada',
      });

      queryRunnerMock.manager.save.mockResolvedValue(sucursal);

      const resultado = await repository.update(sucursal);

      expect(resultado).toEqual(sucursal);

      expect(dataSourceMock.createQueryRunner).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.connect).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.startTransaction).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.manager.save).toHaveBeenCalledWith(
        Branch,
        sucursal,
      );

      expect(queryRunnerMock.commitTransaction).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.rollbackTransaction).not.toHaveBeenCalled();

      expect(queryRunnerMock.release).toHaveBeenCalledTimes(1);
    });

    it('debe hacer rollback cuando ocurre un error al actualizar', async () => {
      const sucursal = crearSucursal({
        id: 1,
      });

      const error = new Error('Error al actualizar');

      queryRunnerMock.manager.save.mockRejectedValue(error);

      await expect(repository.update(sucursal)).rejects.toThrow(error);

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.commitTransaction).not.toHaveBeenCalled();

      expect(queryRunnerMock.release).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================
  // deactivate
  // =========================================================

  describe('deactivate', () => {
    it('debe inactivar una sucursal dentro de una transacción', async () => {
      queryRunnerMock.manager.update.mockResolvedValue({
        affected: 1,
      });

      await repository.deactivate(1);

      expect(dataSourceMock.createQueryRunner).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.connect).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.startTransaction).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.manager.update).toHaveBeenCalledWith(
        Branch,
        {
          id: 1,
        },
        {
          is_active: false,
        },
      );

      expect(queryRunnerMock.commitTransaction).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.rollbackTransaction).not.toHaveBeenCalled();

      expect(queryRunnerMock.release).toHaveBeenCalledTimes(1);
    });

    it('debe hacer rollback cuando ocurre un error al inactivar', async () => {
      const error = new Error('Error al inactivar');

      queryRunnerMock.manager.update.mockRejectedValue(error);

      await expect(repository.deactivate(1)).rejects.toThrow(error);

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalledTimes(1);

      expect(queryRunnerMock.commitTransaction).not.toHaveBeenCalled();

      expect(queryRunnerMock.release).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================
  // hasEmployees
  // =========================================================

  describe('hasEmployees', () => {
    it('debe retornar true cuando existen empleados asociados', async () => {
      employeeBranchAssignmentRepositoryMock.count.mockResolvedValue(1);

      const resultado = await repository.hasEmployees(1);

      expect(resultado).toBe(true);

      expect(employeeBranchAssignmentRepositoryMock.count).toHaveBeenCalledWith(
        {
          where: {
            branch: {
              id: 1,
            },
          },
        },
      );
    });

    it('debe retornar false cuando no existen empleados asociados', async () => {
      employeeBranchAssignmentRepositoryMock.count.mockResolvedValue(0);

      const resultado = await repository.hasEmployees(1);

      expect(resultado).toBe(false);

      expect(employeeBranchAssignmentRepositoryMock.count).toHaveBeenCalledWith(
        {
          where: {
            branch: {
              id: 1,
            },
          },
        },
      );
    });

    it('debe retornar true cuando existen múltiples asignaciones', async () => {
      employeeBranchAssignmentRepositoryMock.count.mockResolvedValue(5);

      const resultado = await repository.hasEmployees(1);

      expect(resultado).toBe(true);
    });
  });

  // =========================================================
  // hasHistoricalRecords
  // =========================================================

  describe('hasHistoricalRecords', () => {
    it('debe retornar true cuando existen registros históricos', async () => {
      attendanceRecordRepositoryMock.count.mockResolvedValue(1);

      const resultado = await repository.hasHistoricalRecords(1);

      expect(resultado).toBe(true);

      expect(attendanceRecordRepositoryMock.count).toHaveBeenCalledWith({
        where: {
          branch: {
            id: 1,
          },
        },
      });
    });

    it('debe retornar false cuando no existen registros históricos', async () => {
      attendanceRecordRepositoryMock.count.mockResolvedValue(0);

      const resultado = await repository.hasHistoricalRecords(1);

      expect(resultado).toBe(false);

      expect(attendanceRecordRepositoryMock.count).toHaveBeenCalledWith({
        where: {
          branch: {
            id: 1,
          },
        },
      });
    });

    it('debe retornar true cuando existen múltiples registros históricos', async () => {
      attendanceRecordRepositoryMock.count.mockResolvedValue(10);

      const resultado = await repository.hasHistoricalRecords(1);

      expect(resultado).toBe(true);
    });
  });
});

// =============================================================
// Helper
// =============================================================

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
