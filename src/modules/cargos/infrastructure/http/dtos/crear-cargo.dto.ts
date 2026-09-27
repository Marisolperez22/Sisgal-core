import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CrearCargoCommand } from '../../../application/commands/cargo.commands';

export class CrearCargoDto implements CrearCargoCommand {
  @ApiProperty({
    description: 'Nombre del cargo',
    example: 'Cocinero',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({
    message: 'El nombre del cargo debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El nombre del cargo es obligatorio',
  })
  @MinLength(2, {
    message: 'El nombre del cargo debe tener al menos 2 caracteres',
  })
  @MaxLength(100, {
    message: 'El nombre del cargo no debe superar los 100 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly nombre!: string;

  @ApiPropertyOptional({
    description: 'Descripción de las funciones del cargo',
    example: 'Preparación de alimentos en la línea caliente',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({
    message: 'La descripción debe ser una cadena de texto',
  })
  @MaxLength(255, {
    message: 'La descripción no debe superar los 255 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly descripcion?: string;
}
