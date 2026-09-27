import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PositionController } from './position.controller';
import { PositionService } from '../../../application/services/position.service';

import { JwtAuthGuard } from 'src/infraestructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infraestructure/auth/guards/roles.guard';

import { Position } from 'src/entities';

describe('PositionController', () => {
  let controller: PositionController;

  const positionServiceMock = {
    obtenerActivos: jest.fn(),
    obtenerTodos: jest.fn(),
    obtenerPorId: jest.fn(),
    crear: jest.fn(),
    actualizar: jest.fn(),
    eliminar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PositionController],
      providers: [
        {
          provide: PositionService,
          useValue: positionServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<PositionController>(PositionController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  // =========================================================
  // GET /cargos/activos
  // =========================================================

  describe('obtenerActivos', () => {
    it('debe retornar los cargos activos mapeados al DTO de respuesta', async () => {
      positionServiceMock.obtenerActivos.mockResolvedValue([
        crearCargo({ id: 1, name: 'Cocinero' }),
      ]);

      const resultado = await controller.obtenerActivos();

      expect(resultado).toEqual([
        { id: 1, name: 'Cocinero', description: null, is_active: true },
      ]);
    });
  });

  // =========================================================
  // GET /cargos
  // =========================================================

  describe('obtenerTodos', () => {
    it.each([
      [undefined, undefined],
      ['true', true],
      ['false', false],
    ])(
      'debe convertir activos=%s en el filtro %s',
      async (activos, filtroEsperado) => {
        positionServiceMock.obtenerTodos.mockResolvedValue([]);

        await controller.obtenerTodos(activos);

        expect(positionServiceMock.obtenerTodos).toHaveBeenCalledWith(
          filtroEsperado,
        );
      },
    );

    it('debe lanzar BadRequestException cuando activos no es booleano', async () => {
      await expect(controller.obtenerTodos('si')).rejects.toThrow(
        new BadRequestException(
          'El parámetro "activos" debe ser "true" o "false".',
        ),
      );

      expect(positionServiceMock.obtenerTodos).not.toHaveBeenCalled();
    });

    it('no debe exponer la relación con empleados en la respuesta', async () => {
      const cargo = crearCargo({ id: 2, name: 'Mesero', is_active: false });
      cargo.employees = [];

      positionServiceMock.obtenerTodos.mockResolvedValue([cargo]);

      const [resultado] = await controller.obtenerTodos();

      expect(resultado).not.toHaveProperty('employees');
      expect(resultado.is_active).toBe(false);
    });
  });

  // =========================================================
  // GET /cargos/:id
  // =========================================================

  describe('obtenerPorId', () => {
    it('debe retornar el cargo solicitado', async () => {
      positionServiceMock.obtenerPorId.mockResolvedValue(
        crearCargo({ id: 3, name: 'Cajero', description: 'Caja principal' }),
      );

      const resultado = await controller.obtenerPorId(3);

      expect(positionServiceMock.obtenerPorId).toHaveBeenCalledWith(3);
      expect(resultado).toEqual({
        id: 3,
        name: 'Cajero',
        description: 'Caja principal',
        is_active: true,
      });
    });
  });

  // =========================================================
  // POST /cargos
  // =========================================================

  describe('crear', () => {
    it('debe crear el cargo y retornar el DTO de respuesta', async () => {
      const dto = { nombre: 'Cocinero', descripcion: 'Línea caliente' };

      positionServiceMock.crear.mockResolvedValue(
        crearCargo({ id: 5, name: 'Cocinero', description: 'Línea caliente' }),
      );

      const resultado = await controller.crear(dto);

      expect(positionServiceMock.crear).toHaveBeenCalledWith(dto);
      expect(resultado.id).toBe(5);
    });
  });

  // =========================================================
  // PATCH /cargos/:id
  // =========================================================

  describe('actualizar', () => {
    it('debe actualizar el cargo y retornar el DTO de respuesta', async () => {
      const dto = { nombre: 'Jefe de cocina' };

      positionServiceMock.actualizar.mockResolvedValue(
        crearCargo({ id: 1, name: 'Jefe de cocina' }),
      );

      const resultado = await controller.actualizar(1, dto);

      expect(positionServiceMock.actualizar).toHaveBeenCalledWith(1, dto);
      expect(resultado.name).toBe('Jefe de cocina');
    });
  });

  // =========================================================
  // DELETE /cargos/:id
  // =========================================================

  describe('eliminar', () => {
    it('debe delegar la inactivación al servicio', async () => {
      positionServiceMock.eliminar.mockResolvedValue(undefined);

      await expect(controller.eliminar(1)).resolves.toBeUndefined();

      expect(positionServiceMock.eliminar).toHaveBeenCalledWith(1);
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
