import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CrearSucursalDto } from './crear-sucursal.dto';

describe('CrearSucursalDto', () => {
  it('debe ser válido cuando se envían todos los datos requeridos y correctos', async () => {
    const rawData = {
      nombre: '  Sucursal Norte  ',
      direccion: '  Calle 100 # 15-20  ',
      telefono: '6017654321',
      ciudad: 'Bogotá',
    };

    const dto = plainToInstance(CrearSucursalDto, rawData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.nombre).toBe('Sucursal Norte');
    expect(dto.direccion).toBe('Calle 100 # 15-20');
  });

  it('debe fallar la validación si el nombre está vacío o ausente (CA05)', async () => {
    const rawData = {
      direccion: 'Calle 100 # 15-20',
    };

    const dto = plainToInstance(CrearSucursalDto, rawData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nombreError = errors.find((err) => err.property === 'nombre');
    expect(nombreError).toBeDefined();
    expect(nombreError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('debe fallar la validación si la dirección está ausente', async () => {
    const rawData = {
      nombre: 'Sucursal Centro',
    };

    const dto = plainToInstance(CrearSucursalDto, rawData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const direccionError = errors.find((err) => err.property === 'direccion');
    expect(direccionError).toBeDefined();
    expect(direccionError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('debe permitir crear sucursal sin teléfono ni ciudad (campos opcionales)', async () => {
    const rawData = {
      nombre: 'Sucursal Sur',
      direccion: 'Carrera 50 # 10-30',
    };

    const dto = plainToInstance(CrearSucursalDto, rawData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
