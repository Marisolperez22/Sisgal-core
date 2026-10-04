import { Test, TestingModule } from '@nestjs/testing';

import { AttendanceTodayController } from './attendance-today.controller';
import { AttendanceTodayService } from '../../../application/services/attendance-today.service';

import { Role } from 'src/application/ports/auth/auth-user';
import { ROLES_KEY } from 'src/infraestructure/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/infraestructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infraestructure/auth/guards/roles.guard';

describe('AttendanceTodayController', () => {
  let controller: AttendanceTodayController;

  const attendanceTodayServiceMock = {
    consultarAsistenciaHoy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceTodayController],
      providers: [
        {
          provide: AttendanceTodayService,
          useValue: attendanceTodayServiceMock,
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

    controller = module.get<AttendanceTodayController>(
      AttendanceTodayController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  // =========================================================
  // Seguridad
  // =========================================================

  describe('seguridad', () => {
    it('debe exigir autenticación y validación de roles', () => {
      const guards = Reflect.getMetadata('__guards__', AttendanceTodayController);

      expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    });

    it('debe estar restringido al rol administrador', () => {
      const roles = Reflect.getMetadata(ROLES_KEY, AttendanceTodayController);

      expect(roles).toEqual([Role.ADMINISTRADOR]);
    });
  });

  // =========================================================
  // GET /asistencias/hoy
  // =========================================================

  describe('consultarAsistenciaHoy', () => {
    it('debe retornar la asistencia del día que entrega el servicio', async () => {
      const asistencia = {
        fecha: '2026-10-04',
        actualizadoEn: new Date('2026-10-04T15:00:00.000Z'),
        totalEmpleados: 2,
        presentes: 1,
        ausentes: 1,
        data: [],
      };

      attendanceTodayServiceMock.consultarAsistenciaHoy.mockResolvedValue(
        asistencia,
      );

      await expect(controller.consultarAsistenciaHoy()).resolves.toEqual(
        asistencia,
      );
      expect(
        attendanceTodayServiceMock.consultarAsistenciaHoy,
      ).toHaveBeenCalledTimes(1);
    });

    it('debe propagar los errores del servicio', async () => {
      const error = new Error('Fallo');
      attendanceTodayServiceMock.consultarAsistenciaHoy.mockRejectedValue(
        error,
      );

      await expect(controller.consultarAsistenciaHoy()).rejects.toBe(error);
    });
  });
});
