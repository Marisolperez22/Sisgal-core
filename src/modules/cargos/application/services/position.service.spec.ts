import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PositionService } from './position.service';

import { POSITION_REPOSITORY_PORT } from '../../domain/ports/position.repository.port';
import { NombreCargoDuplicadoError } from '../../domain/errors/nombre-cargo-duplicado.error';

import { AUDIT_PORT } from 'src/application/ports/audit/audit.port';

import { Position } from 'src/entities';

describe('PositionService', () => {
  let service: PositionService;

  const positionRepositoryMock = {
    findAll: jest.fn(),
    findActivos: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
    hasEmployees: jest.fn(),
  };

  const auditPortMock = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionService,
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

    service = module.get<PositionService>(PositionService);
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
  // obtenerTodos / obtenerActivos (CA01, CA06)
  // =========================================================

  describe('obtenerTodos', () => {
    it('debe retornar todos los cargos cuando no se filtra por estado', async () => {
      const cargos = [
        crearCargo({ id: 1, name: 'Cocinero', is_active: true }),
        crearCargo({ id: 2, name: 'Mesero', is_active: false }),
      ];

      positionRepositoryMock.findAll.mockResolvedValue(cargos);

      const resultado = await service.obtenerTodos();

      expect(resultado).toEqual(cargos);
      expect(positionRepositoryMock.findAll).toHaveBeenCalledWith(undefined);
    });

    it('debe propagar el filtro de estado al repositorio', async () => {
      positionRepositoryMock.findAll.mockResolvedValue([]);

      await service.obtenerTodos(false);

      expect(positionRepositoryMock.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('obtenerActivos', () => {
    it('debe retornar solo los cargos activos', async () => {
      const cargos = [crearCargo({ id: 1, name: 'Cocinero', is_active: true })];

      positionRepositoryMock.findActivos.mockResolvedValue(cargos);

      const resultado = await service.obtenerActivos();

      expect(resultado).toEqual(cargos);
      expect(positionRepositoryMock.findActivos).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================
  // obtenerPorId
  // =========================================================

  describe('obtenerPorId', () => {
    it('debe retornar el cargo cuando existe', async () => {
      const cargo = crearCargo({ id: 1, name: 'Cocinero' });

      positionRepositoryMock.findById.mockResolvedValue(cargo);

      await expect(service.obtenerPorId(1)).resolves.toBe(cargo);
    });

    it('debe lanzar NotFoundException cuando el cargo no existe', async () => {
      positionRepositoryMock.findById.mockResolvedValue(null);

      await expect(service.obtenerPorId(99)).rejects.toThrow(
        new NotFoundException(
          'No se encontró un cargo con el identificador 99.',
        ),
      );
    });
  });

  // =========================================================
  // crear (CA02, CA05, CA08)
  // =========================================================

  describe('crear', () => {
    it('debe crear el cargo activo y registrar la auditoría', async () => {
      positionRepositoryMock.findByName.mockResolvedValue(null);
      positionRepositoryMock.create.mockImplementation((cargo: Position) =>
        Promise.resolve({ ...cargo, id: 10 }),
      );

      const resultado = await service.crear({
        nombre: 'Cocinero',
        descripcion: 'Línea caliente',
      });

      expect(resultado).toMatchObject({
        id: 10,
        name: 'Cocinero',
        description: 'Línea caliente',
        is_active: true,
      });

      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'POSITION_CREATED',
          resourceId: 10,
          result: 'SUCCESS',
        }),
      );
    });

    it('debe guardar la descripción vacía como null', async () => {
      positionRepositoryMock.findByName.mockResolvedValue(null);
      positionRepositoryMock.create.mockImplementation((cargo: Position) =>
        Promise.resolve({ ...cargo, id: 11 }),
      );

      const resultado = await service.crear({
        nombre: 'Mesero',
        descripcion: '',
      });

      expect(resultado.description).toBeNull();
    });

    it('debe lanzar ConflictException cuando ya existe un cargo con el mismo nombre', async () => {
      positionRepositoryMock.findByName.mockResolvedValue(
        crearCargo({ id: 1, name: 'Cocinero' }),
      );

      await expect(service.crear({ nombre: 'cocinero' })).rejects.toThrow(
        new ConflictException('Ya existe un cargo con el nombre "cocinero".'),
      );

      expect(positionRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('debe traducir el duplicado detectado por la base de datos a ConflictException', async () => {
      positionRepositoryMock.findByName.mockResolvedValue(null);
      positionRepositoryMock.create.mockRejectedValue(
        new NombreCargoDuplicadoError('Cocinero'),
      );

      await expect(service.crear({ nombre: 'Cocinero' })).rejects.toThrow(
        ConflictException,
      );

      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'POSITION_CREATE_FAILED',
          result: 'FAILED',
        }),
      );
    });

    it('debe registrar la auditoría de fallo y propagar errores inesperados', async () => {
      const error = new Error('Conexión perdida');

      positionRepositoryMock.findByName.mockResolvedValue(null);
      positionRepositoryMock.create.mockRejectedValue(error);

      await expect(service.crear({ nombre: 'Cocinero' })).rejects.toBe(error);

      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'POSITION_CREATE_FAILED',
          metadata: { error: 'Conexión perdida' },
        }),
      );
    });
  });

  // =========================================================
  // actualizar (CA03, CA05, CA07, CA08)
  // =========================================================

  describe('actualizar', () => {
    it('debe actualizar los campos enviados y auditar los cambios', async () => {
      positionRepositoryMock.findById.mockResolvedValue(
        crearCargo({ id: 1, name: 'Cocinero', description: null }),
      );
      positionRepositoryMock.findByName.mockResolvedValue(null);
      positionRepositoryMock.update.mockImplementation((cargo: Position) =>
        Promise.resolve(cargo),
      );

      const resultado = await service.actualizar(1, {
        nombre: 'Jefe de cocina',
        descripcion: 'Coordina la cocina',
      });

      expect(resultado).toMatchObject({
        name: 'Jefe de cocina',
        description: 'Coordina la cocina',
      });

      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'POSITION_UPDATED',
          metadata: {
            changes: {
              nombre: { anterior: 'Cocinero', nuevo: 'Jefe de cocina' },
              descripcion: { anterior: null, nuevo: 'Coordina la cocina' },
            },
          },
        }),
      );
    });

    it('no debe validar duplicados cuando solo cambian mayúsculas del mismo nombre', async () => {
      positionRepositoryMock.findById.mockResolvedValue(
        crearCargo({ id: 1, name: 'cocinero' }),
      );
      positionRepositoryMock.update.mockImplementation((cargo: Position) =>
        Promise.resolve(cargo),
      );

      const resultado = await service.actualizar(1, { nombre: 'Cocinero' });

      expect(resultado.name).toBe('Cocinero');
      expect(positionRepositoryMock.findByName).not.toHaveBeenCalled();
    });

    it('debe permitir actualizar solo la descripción sin tocar el nombre', async () => {
      positionRepositoryMock.findById.mockResolvedValue(
        crearCargo({ id: 1, name: 'Cocinero', description: 'Anterior' }),
      );
      positionRepositoryMock.update.mockImplementation((cargo: Position) =>
        Promise.resolve(cargo),
      );

      const resultado = await service.actualizar(1, { descripcion: '' });

      expect(resultado.name).toBe('Cocinero');
      expect(resultado.description).toBeNull();
      expect(positionRepositoryMock.findByName).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException cuando el cargo no existe', async () => {
      positionRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        service.actualizar(99, { nombre: 'Mesero' }),
      ).rejects.toThrow(NotFoundException);

      expect(positionRepositoryMock.update).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException cuando otro cargo ya usa el nombre', async () => {
      positionRepositoryMock.findById.mockResolvedValue(
        crearCargo({ id: 1, name: 'Cocinero' }),
      );
      positionRepositoryMock.findByName.mockResolvedValue(
        crearCargo({ id: 2, name: 'Mesero' }),
      );

      await expect(service.actualizar(1, { nombre: 'Mesero' })).rejects.toThrow(
        new ConflictException('Ya existe un cargo con el nombre "Mesero".'),
      );

      expect(positionRepositoryMock.update).not.toHaveBeenCalled();
      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'POSITION_UPDATE_FAILED' }),
      );
    });
  });

  // =========================================================
  // eliminar (CA04, CA07, CA08)
  // =========================================================

  describe('eliminar', () => {
    it('debe inactivar el cargo cuando no tiene dependencias', async () => {
      positionRepositoryMock.findById.mockResolvedValue(
        crearCargo({ id: 1, name: 'Cocinero', is_active: true }),
      );
      positionRepositoryMock.hasEmployees.mockResolvedValue(false);
      positionRepositoryMock.deactivate.mockResolvedValue(undefined);

      await service.eliminar(1);

      expect(positionRepositoryMock.deactivate).toHaveBeenCalledWith(1);
      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'POSITION_DEACTIVATED',
          resourceId: 1,
          result: 'SUCCESS',
        }),
      );
    });

    it('debe lanzar NotFoundException cuando el cargo no existe', async () => {
      positionRepositoryMock.findById.mockResolvedValue(null);

      await expect(service.eliminar(99)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ConflictException cuando el cargo ya está inactivo', async () => {
      positionRepositoryMock.findById.mockResolvedValue(
        crearCargo({ id: 1, name: 'Cocinero', is_active: false }),
      );

      await expect(service.eliminar(1)).rejects.toThrow(
        new ConflictException(
          'El cargo con el identificador 1 ya se encuentra inactivo.',
        ),
      );

      expect(positionRepositoryMock.deactivate).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException cuando el cargo tiene empleados asociados', async () => {
      positionRepositoryMock.findById.mockResolvedValue(
        crearCargo({ id: 1, name: 'Cocinero', is_active: true }),
      );
      positionRepositoryMock.hasEmployees.mockResolvedValue(true);

      await expect(service.eliminar(1)).rejects.toThrow(
        new ConflictException(
          'No se puede desactivar el cargo porque tiene empleados o registros históricos asociados.',
        ),
      );

      expect(positionRepositoryMock.deactivate).not.toHaveBeenCalled();
    });

    it('debe registrar la auditoría de fallo cuando la inactivación falla', async () => {
      const error = new Error('Fallo de base de datos');

      positionRepositoryMock.findById.mockResolvedValue(
        crearCargo({ id: 1, name: 'Cocinero', is_active: true }),
      );
      positionRepositoryMock.hasEmployees.mockResolvedValue(false);
      positionRepositoryMock.deactivate.mockRejectedValue(error);

      await expect(service.eliminar(1)).rejects.toBe(error);

      expect(auditPortMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'POSITION_DEACTIVATE_FAILED',
          result: 'FAILED',
        }),
      );
    });
  });
});

function crearCargo(datos: Partial<Position>): Position {
  return Object.assign(new Position(), {
    description: null,
    is_active: true,
    ...datos,
  });
}
