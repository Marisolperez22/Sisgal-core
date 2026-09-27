import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';

import { ActualizarCargoDto } from './actualizar-cargo.dto';
import { CrearCargoDto } from './crear-cargo.dto';

/**
 * Ejercita los DTOs con la misma configuración del ValidationPipe global de
 * main.ts, para cubrir las validaciones de CA05.
 */
describe('DTOs de cargos', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  const validar = (metatype: ArgumentMetadata['metatype'], value: unknown) =>
    pipe.transform(value, { type: 'body', metatype });

  const mensajes = async (
    metatype: ArgumentMetadata['metatype'],
    value: unknown,
  ): Promise<string[]> => {
    try {
      await validar(metatype, value);
      return [];
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const respuesta = (error as BadRequestException).getResponse() as {
        message: string[];
      };
      return respuesta.message;
    }
  };

  // =========================================================
  // CrearCargoDto
  // =========================================================

  describe('CrearCargoDto', () => {
    it('debe aceptar un cargo válido y recortar los espacios', async () => {
      const dto = await validar(CrearCargoDto, {
        nombre: '  Cocinero  ',
        descripcion: '  Línea caliente ',
      });

      expect(dto).toBeInstanceOf(CrearCargoDto);
      expect(dto).toEqual({
        nombre: 'Cocinero',
        descripcion: 'Línea caliente',
      });
    });

    it('debe exigir el nombre', async () => {
      await expect(mensajes(CrearCargoDto, {})).resolves.toContain(
        'El nombre del cargo es obligatorio',
      );
    });

    it('debe rechazar un nombre compuesto solo por espacios', async () => {
      await expect(
        mensajes(CrearCargoDto, { nombre: '    ' }),
      ).resolves.toContain('El nombre del cargo es obligatorio');
    });

    it('debe rechazar un nombre de más de 100 caracteres', async () => {
      await expect(
        mensajes(CrearCargoDto, { nombre: 'a'.repeat(101) }),
      ).resolves.toContain(
        'El nombre del cargo no debe superar los 100 caracteres',
      );
    });

    it('debe rechazar propiedades no declaradas', async () => {
      const errores = await mensajes(CrearCargoDto, {
        nombre: 'Cocinero',
        is_active: false,
      });

      expect(errores).toContain('property is_active should not exist');
    });
  });

  // =========================================================
  // ActualizarCargoDto
  // =========================================================

  describe('ActualizarCargoDto', () => {
    it('debe aceptar un cuerpo parcial', async () => {
      await expect(
        validar(ActualizarCargoDto, { descripcion: 'Nueva' }),
      ).resolves.toEqual({ descripcion: 'Nueva' });
    });

    it('debe rechazar un nombre vacío cuando se envía', async () => {
      await expect(
        mensajes(ActualizarCargoDto, { nombre: '' }),
      ).resolves.toContain('El nombre del cargo es obligatorio');
    });

    it('debe permitir una descripción vacía para eliminarla', async () => {
      await expect(
        validar(ActualizarCargoDto, { descripcion: '   ' }),
      ).resolves.toEqual({ descripcion: '' });
    });
  });
});
