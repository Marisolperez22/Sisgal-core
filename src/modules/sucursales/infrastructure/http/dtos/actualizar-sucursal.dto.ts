import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class ActualizarSucursalDto {
  @ApiPropertyOptional({
    description: 'Nuevo nombre de la sucursal',
    example: 'Sucursal El Poblado',
    minLength: 2,
    maxLength: 150,
  })
  @IsOptional()
  @IsString({
    message: 'El nombre de la sucursal debe ser una cadena de texto',
  })
  @MinLength(2, {
    message: 'El nombre de la sucursal debe tener al menos 2 caracteres',
  })
  @MaxLength(150, {
    message: 'El nombre de la sucursal no debe superar los 150 caracteres',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly nombre?: string;

  @ApiPropertyOptional({
    description: 'Nueva dirección de la sucursal',
    example: 'Carrera 43A # 10-15',
    minLength: 3,
    maxLength: 200,
  })
  @IsOptional()
  @IsString({
    message: 'La dirección debe ser una cadena de texto',
  })
  @MinLength(3, {
    message: 'La dirección debe tener al menos 3 caracteres',
  })
  @MaxLength(200, {
    message: 'La dirección no debe superar los 200 caracteres',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly direccion?: string;

  @ApiPropertyOptional({
    description: 'Nuevo número telefónico de la sucursal',
    example: '6041234567',
    maxLength: 30,
  })
  @IsOptional()
  @IsString({
    message: 'El teléfono debe ser una cadena de texto',
  })
  @MaxLength(30, {
    message: 'El teléfono no debe superar los 30 caracteres',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly telefono?: string;

  @ApiPropertyOptional({
    description: 'Nueva ciudad de la sucursal',
    example: 'Medellín',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({
    message: 'La ciudad debe ser una cadena de texto',
  })
  @MaxLength(100, {
    message: 'La ciudad no debe superar los 100 caracteres',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly ciudad?: string;
}