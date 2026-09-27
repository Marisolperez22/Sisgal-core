import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ActualizarCargoCommand } from '../../../application/commands/cargo.commands';

export class ActualizarCargoDto implements ActualizarCargoCommand {
  @ApiPropertyOptional({
    description: 'Nuevo nombre del cargo',
    example: 'Jefe de cocina',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
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
  readonly nombre?: string;

  @ApiPropertyOptional({
    description:
      'Nueva descripción del cargo. Enviar una cadena vacía la elimina.',
    example: 'Coordina el personal de cocina',
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
