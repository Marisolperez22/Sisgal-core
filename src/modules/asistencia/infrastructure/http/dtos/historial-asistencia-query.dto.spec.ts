import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { HistorialAsistenciaQueryDto } from './historial-asistencia-query.dto';

/**
 * Ejercita el DTO con la misma configuración del ValidationPipe global de
 * main.ts, tal como llegan los parámetros de la URL (siempre como texto).
 */
describe('HistorialAsistenciaQueryDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  const validar = (value: unknown) =>
    pipe.transform(value, {
      type: 'query',
      metatype: HistorialAsistenciaQueryDto,
    });

  const mensajes = async (value: unknown): Promise<string[]> => {
    try {
      await validar(value);
      return [];
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const respuesta = (error as BadRequestException).getResponse() as {
        message: string[];
      };
      return respuesta.message;
    }
  };

  it('debe aceptar una consulta sin filtros', async () => {
    const dto = await validar({});

    expect(dto).toBeInstanceOf(HistorialAsistenciaQueryDto);
    expect(dto).toEqual({});
  });

  it('debe convertir a número el empleado y la paginación', async () => {
    const dto = await validar({
      empleadoId: '7',
      fechaDesde: '2026-09-01',
      fechaHasta: '2026-09-30',
      estado: 'INCOMPLETO',
      pagina: '2',
      porPagina: '25',
    });

    expect(dto).toEqual({
      empleadoId: 7,
      fechaDesde: '2026-09-01',
      fechaHasta: '2026-09-30',
      estado: 'INCOMPLETO',
      pagina: 2,
      porPagina: 25,
    });
  });

  // =========================================================
  // Estado
  // =========================================================

  it.each([['COMPLETO'], ['INCOMPLETO']])(
    'debe aceptar el estado %s',
    async (estado) => {
      await expect(mensajes({ estado })).resolves.toEqual([]);
    },
  );

  it.each([['PENDIENTE'], ['incompleto'], ['']])(
    'debe rechazar el estado "%s"',
    async (estado) => {
      await expect(mensajes({ estado })).resolves.toContain(
        'El estado debe ser COMPLETO o INCOMPLETO.',
      );
    },
  );

  // =========================================================
  // Empleado
  // =========================================================

  it.each([['abc'], ['1.5']])(
    'debe rechazar el empleado "%s"',
    async (empleadoId) => {
      await expect(mensajes({ empleadoId })).resolves.toContain(
        'El identificador del empleado debe ser un número entero.',
      );
    },
  );

  it('debe rechazar un empleado menor que 1', async () => {
    await expect(mensajes({ empleadoId: '0' })).resolves.toContain(
      'El identificador del empleado debe ser mayor que cero.',
    );
  });

  // =========================================================
  // Fechas
  // =========================================================

  it.each([['2026-02-30'], ['no-es-fecha']])(
    'debe rechazar la fecha inicial "%s"',
    async (fechaDesde) => {
      await expect(mensajes({ fechaDesde })).resolves.toContain(
        'La fechaDesde debe ser una fecha válida.',
      );
    },
  );

  it.each([['15/09/2026'], ['2026-09-15T10:00:00.000Z']])(
    'debe exigir el formato YYYY-MM-DD en la fecha final "%s"',
    async (fechaHasta) => {
      await expect(mensajes({ fechaHasta })).resolves.toContain(
        'La fechaHasta debe tener formato YYYY-MM-DD.',
      );
    },
  );

  // =========================================================
  // Paginación (CA09)
  // =========================================================

  it.each([['10'], ['25'], ['50']])(
    'debe aceptar %s resultados por página',
    async (porPagina) => {
      await expect(mensajes({ porPagina })).resolves.toEqual([]);
    },
  );

  it.each([['0'], ['20'], ['100'], ['abc']])(
    'debe rechazar %s resultados por página',
    async (porPagina) => {
      await expect(mensajes({ porPagina })).resolves.toContain(
        'La cantidad de resultados por página debe ser 10, 25 o 50.',
      );
    },
  );

  it('debe rechazar una página menor que 1', async () => {
    await expect(mensajes({ pagina: '0' })).resolves.toContain(
      'La página debe ser mayor que cero.',
    );
  });

  it('debe rechazar una página que no es un número entero', async () => {
    await expect(mensajes({ pagina: 'dos' })).resolves.toContain(
      'La página debe ser un número entero.',
    );
  });

  // =========================================================
  // Parámetros desconocidos
  // =========================================================

  it('debe rechazar los parámetros que no hacen parte de la consulta', async () => {
    await expect(mensajes({ sucursalId: '1' })).resolves.toContain(
      'property sucursalId should not exist',
    );
  });
});
