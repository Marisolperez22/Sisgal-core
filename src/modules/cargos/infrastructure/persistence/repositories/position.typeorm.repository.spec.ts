import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DataSource, QueryFailedError } from 'typeorm';

import { PositionTypeOrmRepository } from './position.typeorm.repository';

import { Employee, Position } from 'src/entities';

import { NombreCargoDuplicadoError } from '../../../domain/errors/nombre-cargo-duplicado.error';

describe('PositionTypeOrmRepository', () => {
  let repository: PositionTypeOrmRepository;

  const queryBuilderMock = {
    where: jest.fn(),
    getOne: jest.fn(),
  };

  const positionRepositoryMock = {
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const employeeRepositoryMock = {
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
    positionRepositoryMock.createQueryBuilder.mockReturnValue(queryBuilderMock);
    queryBuilderMock.where.mockReturnValue(queryBuilderMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionTypeOrmRepository,
        {
          provide: getRepositoryToken(Position),
          useValue: positionRepositoryMock,
        },
        {
          provide: getRepositoryToken(Employee),
          useValue: employeeRepositoryMock,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    repository = module.get<PositionTypeOrmRepository>(
      PositionTypeOrmRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  // =========================================================
  // Consultas
  // =========================================================

  describe('findAll', () => {
    it('debe consultar todos los cargos ordenados por nombre', async () => {
      positionRepositoryMock.find.mockResolvedValue([]);

      await repository.findAll();

      expect(positionRepositoryMock.find).toHaveBeenCalledWith({
        where: {},
        order: { name: 'ASC' },
      });
    });

    it('debe filtrar por estado cuando se indica', async () => {
      positionRepositoryMock.find.mockResolvedValue([]);

      await repository.findAll(false);

      expect(positionRepositoryMock.find).toHaveBeenCalledWith({
        where: { is_active: false },
        order: { name: 'ASC' },
      });
    });
  });

  describe('findActivos', () => {
    it('debe consultar solo los cargos activos', async () => {
      positionRepositoryMock.find.mockResolvedValue([]);

      await repository.findActivos();

      expect(positionRepositoryMock.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { is_active: true } }),
      );
    });
  });

  describe('findById', () => {
    it('debe buscar el cargo por identificador', async () => {
      positionRepositoryMock.findOne.mockResolvedValue(null);

      await expect(repository.findById(1)).resolves.toBeNull();

      expect(positionRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('findByName', () => {
    it('debe buscar el nombre sin distinguir mayúsculas', async () => {
      const cargo = new Position();
      queryBuilderMock.getOne.mockResolvedValue(cargo);

      await expect(repository.findByName('COCINERO')).resolves.toBe(cargo);

      expect(queryBuilderMock.where).toHaveBeenCalledWith(
        'LOWER(position.name) = LOWER(:name)',
        { name: 'COCINERO' },
      );
    });
  });

  // =========================================================
  // create
  // =========================================================

  describe('create', () => {
    it('debe guardar el cargo dentro de una transacción', async () => {
      const cargo = Object.assign(new Position(), { name: 'Cocinero' });
      const guardado = { ...cargo, id: 1 };

      queryRunnerMock.manager.create.mockReturnValue(cargo);
      queryRunnerMock.manager.save.mockResolvedValue(guardado);

      await expect(repository.create(cargo)).resolves.toBe(guardado);

      expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.rollbackTransaction).not.toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });

    it('debe hacer rollback y traducir la violación de unicidad', async () => {
      const cargo = Object.assign(new Position(), { name: 'Cocinero' });

      queryRunnerMock.manager.create.mockReturnValue(cargo);
      queryRunnerMock.manager.save.mockRejectedValue(crearErrorUnicidad());

      await expect(repository.create(cargo)).rejects.toBeInstanceOf(
        NombreCargoDuplicadoError,
      );

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });

    it('debe propagar sin cambios los demás errores', async () => {
      const cargo = Object.assign(new Position(), { name: 'Cocinero' });
      const error = new Error('Conexión perdida');

      queryRunnerMock.manager.create.mockReturnValue(cargo);
      queryRunnerMock.manager.save.mockRejectedValue(error);

      await expect(repository.create(cargo)).rejects.toBe(error);

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    });
  });

  // =========================================================
  // update
  // =========================================================

  describe('update', () => {
    it('debe actualizar el cargo dentro de una transacción', async () => {
      const cargo = Object.assign(new Position(), { id: 1, name: 'Mesero' });

      queryRunnerMock.manager.save.mockResolvedValue(cargo);

      await expect(repository.update(cargo)).resolves.toBe(cargo);

      expect(queryRunnerMock.manager.save).toHaveBeenCalledWith(
        Position,
        cargo,
      );
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    });

    it('debe hacer rollback y traducir la violación de unicidad', async () => {
      const cargo = Object.assign(new Position(), { id: 1, name: 'Mesero' });

      queryRunnerMock.manager.save.mockRejectedValue(crearErrorUnicidad());

      await expect(repository.update(cargo)).rejects.toBeInstanceOf(
        NombreCargoDuplicadoError,
      );

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    });
  });

  // =========================================================
  // deactivate
  // =========================================================

  describe('deactivate', () => {
    it('debe marcar el cargo como inactivo sin eliminarlo', async () => {
      queryRunnerMock.manager.update.mockResolvedValue(undefined);

      await repository.deactivate(1);

      expect(queryRunnerMock.manager.update).toHaveBeenCalledWith(
        Position,
        { id: 1 },
        { is_active: false },
      );
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    });

    it('debe hacer rollback cuando falla', async () => {
      const error = new Error('Fallo');
      queryRunnerMock.manager.update.mockRejectedValue(error);

      await expect(repository.deactivate(1)).rejects.toBe(error);

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });
  });

  // =========================================================
  // hasEmployees
  // =========================================================

  describe('hasEmployees', () => {
    it.each([
      [0, false],
      [3, true],
    ])(
      'con %i empleados asociados debe retornar %s',
      async (cantidad, esperado) => {
        employeeRepositoryMock.count.mockResolvedValue(cantidad);

        await expect(repository.hasEmployees(1)).resolves.toBe(esperado);

        expect(employeeRepositoryMock.count).toHaveBeenCalledWith({
          where: { jobPosition: { id: 1 } },
        });
      },
    );
  });
});

function crearErrorUnicidad(): QueryFailedError {
  return new QueryFailedError('INSERT', [], {
    code: '23505',
    message: 'duplicate key value violates unique constraint',
  } as unknown as Error);
}
