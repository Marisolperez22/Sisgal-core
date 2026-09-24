import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CrearSucursalDto {
  @IsString({ message: 'El nombre de la sucursal debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la sucursal es obligatorio' })
  @MinLength(2, {
    message: 'El nombre de la sucursal debe tener al menos 2 caracteres',
  })
  @MaxLength(150, {
    message: 'El nombre de la sucursal no debe superar los 150 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly nombre: string;

  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección de la sucursal es obligatoria' })
  @MaxLength(200, {
    message: 'La dirección no debe superar los 200 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly direccion: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(30, {
    message: 'El teléfono no debe superar los 30 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly telefono?: string;

  @IsOptional()
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  @MaxLength(100, {
    message: 'La ciudad no debe superar los 100 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly ciudad?: string;
}
