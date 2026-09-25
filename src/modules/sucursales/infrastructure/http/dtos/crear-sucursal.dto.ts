import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrearSucursalDto {
  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sucursal Centro',
    minLength: 2,
    maxLength: 150,
  })
  @IsString({
    message: 'El nombre de la sucursal debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El nombre de la sucursal es obligatorio',
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
  readonly nombre!: string;

  @ApiProperty({
    description: 'Dirección física de la sucursal',
    example: 'Carrera 43A # 10-15',
    maxLength: 200,
  })
  @IsString({
    message: 'La dirección debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'La dirección de la sucursal es obligatoria',
  })
  @MaxLength(200, {
    message: 'La dirección no debe superar los 200 caracteres',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly direccion!: string;

  @ApiPropertyOptional({
    description: 'Número telefónico de la sucursal',
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
    description: 'Ciudad donde se encuentra ubicada la sucursal',
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
  readonly ciudad!: string;

  @ApiProperty({
    description: 'Identificador de la empresa a la que pertenece la sucursal.',
    example: 1,
  })
  @IsInt({
    message: 'El identificador de la empresa debe ser un número entero',
  })
  readonly companyId!: number;
}