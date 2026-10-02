import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LoanStatus } from '../../../enums/loan-status.enum';

export class LoanQueryDto {
  @ApiPropertyOptional({
    description: 'Identificador del empleado',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'El identificador del empleado debe ser un número entero.',
  })
  @Min(1, { message: 'El identificador del empleado debe ser mayor que cero.' })
  empleadoId?: number;

  @ApiPropertyOptional({
    description: 'Búsqueda parcial por nombre o apellido del empleado',
    example: 'maría pé',
  })
  @IsOptional()
  @IsString({ message: 'El nombre del empleado debe ser una cadena de texto.' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  nombreEmpleado?: string;

  @ApiPropertyOptional({
    description: 'Número de documento del empleado',
    example: '123456789',
  })
  @IsOptional()
  @IsString({ message: 'El documento debe ser una cadena de texto.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  documento?: string;

  @ApiPropertyOptional({
    enum: LoanStatus,
    description: 'Estado actual del préstamo',
  })
  @IsOptional()
  @IsEnum(LoanStatus, { message: 'El estado del préstamo no es válido.' })
  estado?: LoanStatus;

  @ApiPropertyOptional({
    description: 'Fecha inicial de otorgamiento (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString(
    { strict: true },
    { message: 'La fechaDesde debe ser una fecha válida.' },
  )
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fechaDesde debe tener formato YYYY-MM-DD.',
  })
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha final de otorgamiento (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString(
    { strict: true },
    { message: 'La fechaHasta debe ser una fecha válida.' },
  )
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fechaHasta debe tener formato YYYY-MM-DD.',
  })
  fechaHasta?: string;
}
