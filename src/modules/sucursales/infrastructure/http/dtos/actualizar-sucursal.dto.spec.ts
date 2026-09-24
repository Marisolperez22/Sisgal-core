import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ActualizarSucursalDto } from './actualizar-sucursal.dto';

describe('ActualizarSucursalDto', () => {
  it('debe ser válido cuando se actualizan todos los campos con valores correctos', async () => {
    const rawData = {
      nombre: '  Sucursal Occidente Renovada  ',
      direccion: '  Avenida Siempre Viva 742  ',
      telefono: '6019876543',
      ciudad: 'Medellín',
    };

    const dto = plainToInstance(ActualizarSucursalDto, rawData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.nombre).toBe('Sucursal Occidente Renovada');
    expect(dto.direccion).toBe('Avenida Siempre Viva 742');
  });

  it('debe ser válido cuando se actualiza solo un campo parcial (e.g. solo dirección)', async () => {
    const rawData = {
      direccion: 'Nueva Carrera 7 # 45-10',
    };

    const dto = plainToInstance(ActualizarSucursalDto, rawData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.direccion).toBe('Nueva Carrera 7 # 45-10');
    expect(dto.nombre).toBeUndefined();
  });

  it('debe ser válido cuando el objeto está vacío (sin cambios a aplicar)', async () => {
    const rawData = {};

    const dto = plainToInstance(ActualizarSucursalDto, rawData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('debe fallar si se intenta enviar un nombre vacío o con solo espacios (CA05)', async () => {
    const rawData = {
      nombre: '   ',
    };

    const dto = plainToInstance(ActualizarSucursalDto, rawData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nombreError = errors.find((err) => err.property === 'nombre');
    expect(nombreError).toBeDefined();
    expect(nombreError?.constraints).toHaveProperty('minLength');
  });

  it('debe fallar si la dirección contiene menos de 3 caracteres', async () => {
    const rawData = {
      direccion: 'AB',
    };

    const dto = plainToInstance(ActualizarSucursalDto, rawData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const direccionError = errors.find((err) => err.property === 'direccion');
    expect(direccionError).toBeDefined();
    expect(direccionError?.constraints).toHaveProperty('minLength');
  });

  it('debe fallar si el teléfono supera la longitud máxima permitida', async () => {
    const rawData = {
      telefono: '1'.repeat(31),
    };

    const dto = plainToInstance(ActualizarSucursalDto, rawData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const telefonoError = errors.find((err) => err.property === 'telefono');
    expect(telefonoError).toBeDefined();
    expect(telefonoError?.constraints).toHaveProperty('maxLength');
  });
});
